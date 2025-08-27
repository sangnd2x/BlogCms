import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateArticleUserRelationship1756183601177 implements MigrationInterface {
    name = 'UpdateArticleUserRelationship1756183601177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ADD "excerpt" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "excerpt"`);
    }

}
