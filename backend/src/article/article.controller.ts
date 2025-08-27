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

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createArticleDto: CreateArticleDto, @GetUser() user: User) {
    return this.articleService.create(createArticleDto, user.id);
  }

  @Public()
  @Get()
  findAll(@Query() query: ArticleQueryParams) {
    return this.articleService.findAll(query);
  }

  // Api for reading article
  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articleService.findBySlug(slug);
  }

  // Api for admin to read article
  // @UseGuards(AdminGuard)
  // @Get('admin/:id')
  // findOne(@Param('id') id: string) {
  //   return this.articleService.findOne(id);
  // }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdateArticleDto,
    @GetUser() user: User,
  ) {
    return this.articleService.update(id, updatePostDto, user.id);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.articleService.remove(id, user.id);
  }
}
