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
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { Public } from '../common/decorators/public.decorator';
import { ArticleQueryParams } from './params/article-query.param';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createArticleDto: CreateArticleDto, @GetUser() user: User) {
    return this.articleService.create(createArticleDto, user.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: ArticleQueryParams) {
    return this.articleService.findAll(query);
  }

  @Get(':slug')
  @Public() // Public endpoint for reading posts
  findBySlug(@Param('slug') slug: string) {
    return this.articleService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdateArticleDto,
    @GetUser() user: User,
  ) {
    return this.articleService.update(id, updatePostDto, user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.articleService.remove(id, user.id);
  }
}
