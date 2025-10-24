import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { ArticleQueryParams } from './params/article-query.param';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createArticleDto: CreateBlogDto, @GetUser() user: User) {
    return this.blogService.create(createArticleDto, user.id);
  }

  @Public()
  @Get()
  findAll(@Query() query: ArticleQueryParams) {
    return this.blogService.findAll(query);
  }

  // Api for reading article
  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // Api for admin to read article
  @UseGuards(AdminGuard)
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdateBlogDto,
    @GetUser() user: User,
  ) {
    return this.blogService.update(id, updatePostDto, user.id);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.blogService.remove(id, user.id);
  }
}
