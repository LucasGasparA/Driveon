-- DropForeignKey
ALTER TABLE "public"."item_ordem_servico" DROP CONSTRAINT "item_ordem_servico_ordem_servico_id_fkey";

-- AddForeignKey
ALTER TABLE "item_ordem_servico" ADD CONSTRAINT "item_ordem_servico_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordem_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
