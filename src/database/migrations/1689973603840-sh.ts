import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1689973603840 implements MigrationInterface {
    name = 'Sh1689973603840'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying, "user_id" integer, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_60818528127866f5002e7f826d" ON "posts" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_117d314fdebad6020478d46dc2" ON "posts" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_5378807f28855132d256a3e45c" ON "posts" ("description") `);
        await queryRunner.query(`CREATE INDEX "IDX_c4f9a7bd77b489e711277ee598" ON "posts" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "entityType" character varying, "file_path" character varying, "file_type" character varying, "entity_id" integer, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c66506fd4a933e403dc80edd69" ON "files" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_03a348d651af949108f927ce8f" ON "files" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ec36b772343dc48a6e30422ac" ON "files" ("entityType") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d1655a1893f7d4e2585d9c43f" ON "files" ("entity_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d1655a1893f7d4e2585d9c43f" ON "files" ("entity_id") `);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "gender" character varying, "relationship_type" character varying, "min_age" integer, "max_age" integer, "hobbies" character varying, "user_id" integer, "radius" numeric, "gender_preference" character varying, "religion" character varying, "body_type" character varying, "height" integer, "ethnicity" character varying, "longitude" numeric, "latitude" numeric, "dob" date, CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4366b023132e3c83106c6d38bc" ON "profiles" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_8f9310dd5afeb38d7239af6ed4" ON "profiles" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_9e432b7df0d182f8d292902d1a" ON "profiles" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_de485cd05e89661c1952ab6323" ON "profiles" ("longitude") `);
        await queryRunner.query(`CREATE INDEX "IDX_7281cca77ec136303425e995ac" ON "profiles" ("latitude") `);
        await queryRunner.query(`CREATE TABLE "matches" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id_1" integer, "user_id_2" integer, CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3c243f0ac25405546ae19414ec" ON "matches" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d1afbce665cbff080ac47e476" ON "matches" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_7aa5e17f6613086b7868c9f8c9" ON "matches" ("user_id_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_379d8afc11e29704460ac43111" ON "matches" ("user_id_2") `);
        await queryRunner.query(`CREATE TABLE "like_caches" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "liker" integer, "likee" integer, CONSTRAINT "PK_66b47c94c424825cc703b9670cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ec708cae5c93b7a44889beeabd" ON "like_caches" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_1647873befd9923a23395da6f1" ON "like_caches" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_46f7fa399256cf5b041057b32c" ON "like_caches" ("liker") `);
        await queryRunner.query(`CREATE INDEX "IDX_884b711836629f5b47c7f209b2" ON "like_caches" ("likee") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying, "name" character varying, "password" character varying, "phone_number" character varying, "otp" character varying, "otp_verified" boolean DEFAULT false, "description" text, "profile_id" integer, CONSTRAINT "REL_23371445bd80cb3e413089551b" UNIQUE ("profile_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c9b5b525a96ddc2c5647d7f7fa" ON "users" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_6d596d799f9cb9dac6f7bf7c23" ON "users" ("updated_at") `);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "country" character varying, "city" character varying, "state" character varying, "postal_code" integer, "user_id" integer, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8813e791fe4c6cc9de77c950c7" ON "addresses" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_f695ee88c4fefac775eb871aea" ON "addresses" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_16aac8a9f6f9c1dd6bcb75ec02" ON "addresses" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_8d1655a1893f7d4e2585d9c43f7" FOREIGN KEY ("entity_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_8d1655a1893f7d4e2585d9c43f7" FOREIGN KEY ("entity_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_7aa5e17f6613086b7868c9f8c92" FOREIGN KEY ("user_id_1") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_379d8afc11e29704460ac431115" FOREIGN KEY ("user_id_2") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like_caches" ADD CONSTRAINT "FK_46f7fa399256cf5b041057b32c5" FOREIGN KEY ("liker") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like_caches" ADD CONSTRAINT "FK_884b711836629f5b47c7f209b23" FOREIGN KEY ("likee") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_23371445bd80cb3e413089551bf" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "typeorm_cache_table" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_1f1c066da68820c20a4ff873df1" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "typeorm_cache_table"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_23371445bd80cb3e413089551bf"`);
        await queryRunner.query(`ALTER TABLE "like_caches" DROP CONSTRAINT "FK_884b711836629f5b47c7f209b23"`);
        await queryRunner.query(`ALTER TABLE "like_caches" DROP CONSTRAINT "FK_46f7fa399256cf5b041057b32c5"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_379d8afc11e29704460ac431115"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_7aa5e17f6613086b7868c9f8c92"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_8d1655a1893f7d4e2585d9c43f7"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_8d1655a1893f7d4e2585d9c43f7"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16aac8a9f6f9c1dd6bcb75ec02"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f695ee88c4fefac775eb871aea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8813e791fe4c6cc9de77c950c7"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6d596d799f9cb9dac6f7bf7c23"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9b5b525a96ddc2c5647d7f7fa"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_884b711836629f5b47c7f209b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_46f7fa399256cf5b041057b32c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1647873befd9923a23395da6f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec708cae5c93b7a44889beeabd"`);
        await queryRunner.query(`DROP TABLE "like_caches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_379d8afc11e29704460ac43111"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7aa5e17f6613086b7868c9f8c9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d1afbce665cbff080ac47e476"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c243f0ac25405546ae19414ec"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7281cca77ec136303425e995ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_de485cd05e89661c1952ab6323"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e432b7df0d182f8d292902d1a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f9310dd5afeb38d7239af6ed4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4366b023132e3c83106c6d38bc"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d1655a1893f7d4e2585d9c43f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d1655a1893f7d4e2585d9c43f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ec36b772343dc48a6e30422ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_03a348d651af949108f927ce8f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c66506fd4a933e403dc80edd69"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c4f9a7bd77b489e711277ee598"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5378807f28855132d256a3e45c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_117d314fdebad6020478d46dc2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60818528127866f5002e7f826d"`);
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
