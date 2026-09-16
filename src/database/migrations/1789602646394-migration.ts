import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1789602646394 implements MigrationInterface {
  name = 'Migration1789602646394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."scan_job_dimension_enum" AS ENUM('minecraft:overworld', 'minecraft:the_end', 'minecraft:the_nether')`,
    );
    await queryRunner.query(
      `CREATE TABLE "scan_job" ("id" SERIAL NOT NULL, "dimension" "public"."scan_job_dimension_enum" NOT NULL, "dimensionIndex" integer NOT NULL, "regionIndex" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f87759bfc64b30c3a9cd54d18e5" UNIQUE ("dimension", "dimensionIndex"), CONSTRAINT "PK_b136e9f9a8b433b3f7d90fd2af0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "client" ("id" character varying NOT NULL, "version" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "scanJobId" integer, CONSTRAINT "REL_a0565295b3b702ebb9d1dc6f83" UNIQUE ("scanJobId"), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dimension_id_enum" AS ENUM('minecraft:overworld', 'minecraft:the_end', 'minecraft:the_nether')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dimension" ("id" "public"."dimension_id_enum" NOT NULL, "indexesScanned" integer array NOT NULL DEFAULT '{}', "dimensionWidth" integer NOT NULL, "blockBlacklist" character varying array NOT NULL DEFAULT '{}', "scanRange" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_653e621826a32965348bd4faff4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."found_block_dimension_enum" AS ENUM('minecraft:overworld', 'minecraft:the_end', 'minecraft:the_nether')`,
    );
    await queryRunner.query(
      `CREATE TABLE "found_block" ("id" SERIAL NOT NULL, "blockId" character varying NOT NULL, "dimension" "public"."found_block_dimension_enum" NOT NULL, "checked" boolean NOT NULL DEFAULT false, "pos" vector(3) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f7173152db3c97bfd03ea2d68ea" UNIQUE ("dimension", "pos"), CONSTRAINT "PK_19abf889b2e2a2c70f417c84ef7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "client" ADD CONSTRAINT "FK_a0565295b3b702ebb9d1dc6f83e" FOREIGN KEY ("scanJobId") REFERENCES "scan_job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client" DROP CONSTRAINT "FK_a0565295b3b702ebb9d1dc6f83e"`,
    );
    await queryRunner.query(`DROP TABLE "found_block"`);
    await queryRunner.query(`DROP TYPE "public"."found_block_dimension_enum"`);
    await queryRunner.query(`DROP TABLE "dimension"`);
    await queryRunner.query(`DROP TYPE "public"."dimension_id_enum"`);
    await queryRunner.query(`DROP TABLE "client"`);
    await queryRunner.query(`DROP TABLE "scan_job"`);
    await queryRunner.query(`DROP TYPE "public"."scan_job_dimension_enum"`);
  }
}
