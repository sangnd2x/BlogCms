import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponseDto } from '../common/response/ApiResponseDto';

export interface DashboardResponse {
  totalBlogs: number;
  totalViewCounts: number;
  totalUsers: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<ApiResponseDto<DashboardResponse>> {
    const [totalBlogs, totalViewCounts, totalUsers] = await Promise.all([
      this.prisma.blog.count({ where: { isActive: true } }),
      this.getTotalViewCounts(),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      data: {
        totalBlogs,
        totalViewCounts,
        totalUsers,
      },
      message: 'Dashboard stats retrieved successfully',
    };
  }

  private async getTotalViewCounts(): Promise<number> {
    const result = await this.prisma.blog.aggregate({
      _sum: {
        viewCounts: true,
      },
      where: { isActive: true },
    });

    return result._sum.viewCounts || 0;
  }
}
