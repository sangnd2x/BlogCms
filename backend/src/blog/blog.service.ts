import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ArticleQueryParams } from './params/article-query.param';
import { Blog, BlogStatusEnum, Prisma } from '@prisma/client';
import { ApiResponseDto } from '../common/response/ApiResponseDto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createArticleDto: CreateBlogDto,
    uuserId: string,
  ): Promise<ApiResponseDto<Blog>> {
    const slug = createArticleDto.title.replace(/\s+/g, '-');

    const newBlog = await this.prisma.blog.create({
      data: {
        title: createArticleDto.title,
        content: createArticleDto.content,
        featuredImage: createArticleDto.featuredImage,
        slug: slug,
        status: createArticleDto.status || BlogStatusEnum.DRAFT,
        publishedAt:
          createArticleDto.status === BlogStatusEnum.PUBLISHED
            ? createArticleDto.publishedAt
              ? new Date(createArticleDto.publishedAt)
              : new Date()
            : createArticleDto.publishedAt
              ? new Date(createArticleDto.publishedAt)
              : null,
        tags: createArticleDto.tags || [],
        categoryId: createArticleDto.categoryId,
        authorId: uuserId,
        createdBy: uuserId,
      },
    });

    return {
      data: newBlog,
      message: 'Blog created successfully',
    };
  }

  async countArticles() {
    return this.prisma.blog.count();
  }

  async countViewCounts() {
    const result = await this.prisma.blog.aggregate({
      _sum: {
        viewCounts: true,
      },
    });

    return result._sum.viewCounts || 0;
  }

  async findAll(
    queryParams: ArticleQueryParams,
  ): Promise<ApiResponseDto<Blog[]>> {
    const {
      search,
      title,
      status,
      authorId,
      category,
      tags,
      publishedAt,
      page = 1,
      limit = 10,
      sortBy = 'createdOn',
      sortOrder = 'DESC',
    } = queryParams;

    // Build where clause
    const where: Prisma.BlogWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (title) {
      where.OR = [
        { title: { contains: title, mode: 'insensitive' } },
        { content: { contains: title, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as BlogStatusEnum;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (category) {
      const categoryIds = category.split(',').map((x) => x.trim());
      where.categoryId = { in: categoryIds };
    }

    if (tags) {
      const tagArr = tags.split(',').map((x) => x.trim());
      where.tags = { hasSome: tagArr };
    }

    if (publishedAt) {
      const [startDate, endDate] = publishedAt.split(',');
      if (startDate && endDate) {
        where.publishedAt = {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z'),
        };
      }
    }

    // Map sort field to Prisma field names
    const sortFieldMap: Record<string, string> = {
      created_on: 'createdOn',
      updated_at: 'updatedOn',
      title: 'title',
      publishedAt: 'publishedAt',
      views_count: 'viewCounts',
    };

    const validSortFields = Object.keys(sortFieldMap);
    const prismaField = sortFieldMap[sortBy] || 'createdOn';
    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Add pagination
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: {
          [prismaField]: orderDirection,
        },
        skip,
        take: limit,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data: blogs,
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
    const blog = await this.prisma.blog.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Increment view count
    await this.prisma.blog.update({
      where: { id: blog.id },
      data: {
        viewCounts: blog.viewCounts + 1,
      },
    });

    return {
      data: blog,
      message: 'Blogs retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ApiResponseDto<Blog>> {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return { data: blog as any, message: 'Blogs retrieved successfully' };
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, uuserId: string) {
    const blog = await this.findOne(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const dataToUpdate: Prisma.BlogUpdateInput = {
      ...(updateBlogDto.title && { title: updateBlogDto.title }),
      ...(updateBlogDto.content && { content: updateBlogDto.content }),
      ...(updateBlogDto.featuredImage && {
        featuredImage: updateBlogDto.featuredImage,
      }),
      ...(updateBlogDto.status && { status: updateBlogDto.status }),
      ...(updateBlogDto.tags && { tags: updateBlogDto.tags }),
      ...(updateBlogDto.categoryId && {
        categoryId: updateBlogDto.categoryId,
      }),
      ...(updateBlogDto.isActive !== undefined && {
        isActive: updateBlogDto.isActive,
      }),
      updatedBy: uuserId,
      updatedOn: new Date(),
    };

    // If status is being changed to published, set publishedAt
    if (
      updateBlogDto.status === BlogStatusEnum.PUBLISHED &&
      blog.data.status !== BlogStatusEnum.PUBLISHED
    ) {
      dataToUpdate.publishedAt = updateBlogDto.publishedAt
        ? new Date(updateBlogDto.publishedAt)
        : new Date();
    } else if (updateBlogDto.publishedAt) {
      dataToUpdate.publishedAt = new Date(updateBlogDto.publishedAt);
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: dataToUpdate,
    });

    return {
      data: updatedBlog,
      message: 'Blogs updated successfully',
    };
  }

  async remove(id: string, uuserId: string) {
    const blog = await this.findOne(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.prisma.blog.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
        deletedBy: uuserId,
        deletedOn: new Date(),
      },
    });

    return {
      data: {},
      message: 'Blogs deleted successfully',
    };
  }
}
