import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1755766812642 implements MigrationInterface {
    name = 'CreateUserTable1755766812642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_user_role_enum" AS ENUM('admin', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_on" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid, "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" uuid, "deleted_on" TIMESTAMP, "deleted_by" uuid, "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying, "last_change_password" TIMESTAMP, "user_role" "public"."user_user_role_enum", "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_user_role_enum"`);
    }

}
