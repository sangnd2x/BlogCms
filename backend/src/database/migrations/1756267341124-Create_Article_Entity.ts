import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArticleEntity1756267341124 implements MigrationInterface {
    name = 'CreateArticleEntity1756267341124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "deleted_on" TIMESTAMP WITH TIME ZONE, "deleted_by" uuid, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "color" character varying, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "article" ADD "tags" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "article" ADD "category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_cdd234ef147c8552a8abd42bd29" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_cdd234ef147c8552a8abd42bd29"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "tags"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
