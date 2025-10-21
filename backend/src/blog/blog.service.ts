import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ArticleQueryParams } from './params/article-query.param';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog, BlogStatus } from './entities/blog.entity';
import { Brackets, Repository } from 'typeorm';
import { ApiResponseDto } from '../common/response/ApiResponseDto';

interface ViewCountResult {
  total: string;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly articleRepository: Repository<Blog>,
  ) {}
  async create(
    createArticleDto: CreateBlogDto,
    userId: string,
  ): Promise<ApiResponseDto<Blog>> {
    const slug = createArticleDto.title.replace(/\s+/g, '-');

    const post = this.articleRepository.create({
      ...createArticleDto,
      slug: slug,
      author_id: userId,
      created_by: userId,
      published_at:
        createArticleDto.status === BlogStatus.PUBLISHED
          ? createArticleDto.published_at || new Date()
          : createArticleDto.published_at,
    });

    await this.articleRepository.save(post);
    return {
      data: post,
      message: 'Blog created successfully',
    };
  }

  async countArticles() {
    return this.articleRepository.count();
  }

  async countViewCounts() {
    const result = await this.articleRepository
      .createQueryBuilder('article')
      .select('SUM(article.views_count)', 'total')
      .getRawOne<ViewCountResult>();

    return parseInt(result?.total || '0', 10);
  }

  async findAll(
    queryParams: ArticleQueryParams,
  ): Promise<ApiResponseDto<Blog[]>> {
    const {
      search,
      title,
      status,
      author_id,
      category,
      tags,
      published_at,
      page = 1,
      limit = 10,
      sort_by = 'created_on',
      sort_order = 'DESC',
    } = queryParams;

    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      .where('article.is_active = :is_active', { is_active: true });

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('article.title ILIKE :search', { search: `%${search}%` })
            .orWhere('article.content ILIKE :search', { search: `%${search}%` })
            .orWhere('author.name ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (title) {
      query.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search)',
        {
          search: `%${title}%`,
        },
      );
    }

    if (status) {
      query.andWhere('article.status = :status', { status });
    }

    if (author_id) {
      query.andWhere('article.author_id = :author_id', { author_id });
    }

    if (category) {
      const categoryIds = category.split(',').map((x) => x.trim());
      query.andWhere('article.category_id IN (:...categoryIds)', {
        categoryIds,
      });
    }

    if (tags && tags.length > 0) {
      const tagArr = tags.split(',').map((x) => x.trim());
      query.andWhere('article.tags IN (:...tagArr)', { tagArr });
    }

    if (published_at) {
      const [startDate, endDate] = published_at.split(',');
      if (startDate && endDate) {
        query.andWhere('article.published_at BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate + 'T23:59:59.999Z'),
        });
      }
    }

    // Add sorting
    const validSortFields = [
      'created_on',
      'updated_at',
      'title',
      'published_at',
      'views_count',
    ];
    const sortField = validSortFields.includes(sort_by)
      ? sort_by
      : 'created_on';
    const orderDirection = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query.orderBy(`article.${sortField}`, orderDirection);

    // Add pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [articles, total] = await query.getManyAndCount();

    return {
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Blogs retrieved successfully',
    };
  }

  async findBySlug(slug: string): Promise<ApiResponseDto<Blog>> {
    const article = await this.articleRepository.findOne({
      where: {
        title: slug.replace(/-/g, ' '),
        is_active: true,
      },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    await this.articleRepository.update(article.id, {
      views_count: article.views_count + 1,
    });

    return {
      data: article,
      message: 'Blogs retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ApiResponseDto<Blog>> {
    const article = await this.articleRepository.findOne({
      where: {
        id,
        is_active: true,
      },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return { data: article, message: 'Blogs retrieved successfully' };
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string) {
    const article = await this.findOne(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const dataToUpdate = {
      ...updateBlogDto,
      updated_by: userId,
    };

    console.log('dataToUpdate', dataToUpdate);

    // If status is being changed to published, set published_at
    if (
      dataToUpdate.status === BlogStatus.PUBLISHED &&
      article.data.status !== BlogStatus.PUBLISHED
    ) {
      dataToUpdate.published_at =
        dataToUpdate.published_at || new Date().toISOString();
    }

    // await this.articleRepository.update(id, dataToUpdate);

    const updatedBlog = await this.articleRepository.save({
      ...article.data,
      ...dataToUpdate,
    });

    return {
      data: updatedBlog,
      message: 'Blogs updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    const article = await this.findOne(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.articleRepository.update(id, {
      is_active: false,
      is_deleted: true,
      deleted_by: userId,
      deleted_on: new Date(),
    });

    return {
      data: {},
      message: 'Blogs deleted successfully',
    };
  }
}
