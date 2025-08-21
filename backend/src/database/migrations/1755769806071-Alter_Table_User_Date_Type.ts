import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableUserDateType1755769806071 implements MigrationInterface {
    name = 'AlterTableUserDateType1755769806071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_on"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_on"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_on"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_on" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_change_password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_change_password" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_change_password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_change_password" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_on"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_on" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_on"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_on" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_on"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_on" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
