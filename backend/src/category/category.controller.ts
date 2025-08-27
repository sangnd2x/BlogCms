import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoryService.create(createCategoryDto, user.id);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoryService.update(id, updateCategoryDto, user.id);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.categoryService.remove(id, user.id);
  }
}
