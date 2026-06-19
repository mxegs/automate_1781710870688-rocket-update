-- Rename Loco → Yoco if you already ran the earlier migration with loco_* columns
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'loco_payment_link'
  ) then
    alter table public.events rename column loco_payment_link to yoco_payment_link;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'loco_product_id'
  ) then
    alter table public.events rename column loco_product_id to yoco_checkout_id;
  end if;
end $$;
