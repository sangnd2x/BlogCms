import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const slug = createCategoryDto.name.replace(/\s+/g, '-');

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug: slug,
      created_by: userId,
    });

    return this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find({
      where: {
        is_active: true,
      },
    });
  }

  async findOne(id: string) {
    return this.categoryRepository.findOne({ where: { id } });
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
    updateCategoryDto.updated_by = userId;

    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.categoryRepository.update(id, {
      is_active: false,
      is_deleted: true,
      deleted_by: userId,
      deleted_on: new Date(),
    });
  }
}
