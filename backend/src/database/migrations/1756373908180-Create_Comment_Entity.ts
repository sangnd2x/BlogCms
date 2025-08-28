import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommentEntity1756373908180 implements MigrationInterface {
    name = 'CreateCommentEntity1756373908180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."media_type_enum" AS ENUM('IMAGE', 'VIDEO')`);
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "deleted_on" TIMESTAMP WITH TIME ZONE, "deleted_by" uuid, "url" character varying NOT NULL, "filename" character varying NOT NULL, "originalName" character varying NOT NULL, "type" "public"."media_type_enum" NOT NULL, "article_id" uuid NOT NULL, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "deleted_on" TIMESTAMP WITH TIME ZONE, "deleted_by" uuid, "content" character varying NOT NULL, "article_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_d5fdfb2ecfc4604d93d18527da9" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_03a590c26b0910b0bb49682b1e3" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_03a590c26b0910b0bb49682b1e3"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_d5fdfb2ecfc4604d93d18527da9"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TYPE "public"."media_type_enum"`);
    }

}
