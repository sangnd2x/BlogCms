import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryParams } from './params/article-query.param';
import { InjectRepository } from '@nestjs/typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly userService: UserService,
  ) {}
  async create(createArticleDto: CreateArticleDto, userId: string) {
    const author = await this.userService.findOne(userId);

    if (!author || author.user_role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin users can create post');
    }

    const slug = createArticleDto.title.replace(/\s+/g, '-');

    const post = this.articleRepository.create({
      ...createArticleDto,
      slug: slug,
      author_id: author.id,
      published_at:
        createArticleDto.status === ArticleStatus.PUBLISHED
          ? createArticleDto.published_at || new Date()
          : createArticleDto.published_at,
    });

    return this.articleRepository.save(post);
  }

  async findAll(queryParams: ArticleQueryParams) {
    const {
      search,
      status,
      author_id,
      // tags,
      page = 1,
      limit = 10,
      sort_by = 'created_on',
      sort_order = 'DESC',
    } = queryParams;

    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.is_active = :is_active', { is_active: true });

    if (search) {
      query.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      query.andWhere('article.status = :status', { status });
    }

    if (author_id) {
      query.andWhere('article.author_id = :author_id', { author_id });
    }

    // TODO: Add tag filter
    // if (tags && tags.length > 0) {
    //   query.andWhere('article.tags && :tags', { tags });
    // }

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
    };
  }

  async findBySlug(slug: string) {
    const article = await this.articleRepository.findOne({
      where: {
        title: slug.replace(/-/g, ' '),
        is_active: true,
      },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    await this.articleRepository.update(article.id, {
      views_count: article.views_count + 1,
    });

    return { ...article, views_count: article.views_count + 1 };
  }

  async findOne(id: string) {
    return await this.articleRepository.findOne({
      where: {
        id,
        is_active: true,
      },
      relations: ['author'],
    });
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, userId: string) {
    const author = await this.userService.findOne(userId);

    if (!author || author.user_role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin users can update post');
    }

    const article = await this.findOne(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // If status is being changed to published, set published_at
    if (
      updateArticleDto.status === ArticleStatus.PUBLISHED &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      updateArticleDto.published_at =
        updateArticleDto.published_at || new Date().toISOString();
    }

    await this.articleRepository.update(id, updateArticleDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const author = await this.userService.findOne(userId);

    if (!author || author.user_role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin users can delete post');
    }

    const article = await this.findOne(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.articleRepository.update(id, { is_active: false });
  }
}
