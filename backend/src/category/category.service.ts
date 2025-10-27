import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category.response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponseDto } from '../common/response/ApiResponseDto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<ApiResponseDto<Category>> {
    const slug = createCategoryDto.name.replace(/\s+/g, '-');

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        color: createCategoryDto.color,
        slug: slug,
        createdBy: userId,
      },
    });

    return {
      data: category,
      message: 'Category created successfully',
    };
  }

  async findAll(): Promise<ApiResponseDto<CategoryResponseDto[]>> {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: { blog: true },
        },
      },
    });

    const categoriesWithBlogCount: CategoryResponseDto[] = categories.map(
      (category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        blogCount: category._count.blog,
        isActive: category.isActive,
        createdOn: category.createdOn,
        updatedOn: category.updatedOn,
      }),
    );

    return {
      data: categoriesWithBlogCount,
      meta: {
        total: categoriesWithBlogCount.length,
      },
      message: 'Categories retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ApiResponseDto<Category>> {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: category,
      message: 'Category retrieved successfully',
    };
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<ApiResponseDto<Category>> {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...(updateCategoryDto.name && { name: updateCategoryDto.name }),
        ...(updateCategoryDto.description && {
          description: updateCategoryDto.description,
        }),
        ...(updateCategoryDto.color && { color: updateCategoryDto.color }),
        updatedBy: userId,
        updatedOn: new Date(),
      },
    });

    return {
      data: updatedCategory,
      message: 'Category updated successfully',
    };
  }

  async remove(id: string, userId: string): Promise<ApiResponseDto<{}>> {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const deletedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
        deletedBy: userId,
        deletedOn: new Date(),
      },
    });

    return {
      data: {},
      message: 'Category deleted successfully',
    };
  }
}
