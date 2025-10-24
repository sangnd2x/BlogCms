import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto, userId: string) {
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

    return category;
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
      },
    });

    return {
      data: categories,
      meta: {
        total: categories.length,
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
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

    return updatedCategory;
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.prisma.category.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
        deletedBy: userId,
        deletedOn: new Date(),
      },
    });
  }
}
