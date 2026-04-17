DO $$
DECLARE
  new_partner_id uuid := gen_random_uuid();
  new_cat_id uuid;
  cat_map jsonb := '{}';
  r record;
BEGIN
  -- 1. Insert cloned partner
  INSERT INTO partners (
    id, name, email, store_name, location, status, upi_id, description, password,
    phone, district, role, store_banner, delivery_status, theme, place_id, currency,
    show_price_data, feature_flags, footnote, social_links, gst_no, gst_percentage,
    whatsapp_numbers, business_type, geo_location, is_shop_open, delivery_rate,
    delivery_rules, state, country, country_code, "isPaid", show_payment_qr,
    hide_unavailable, username, whatsapp_integration_mode, created_at
  )
  SELECT
    new_partner_id, name, 'downtree+1@gmail.com', store_name, location, status, upi_id, description, password,
    phone, district, role, store_banner, delivery_status, theme, place_id, currency,
    show_price_data, feature_flags, footnote, social_links, gst_no, gst_percentage,
    whatsapp_numbers, business_type, geo_location, is_shop_open, delivery_rate,
    delivery_rules, state, country, country_code, "isPaid", show_payment_qr,
    hide_unavailable, 'downtree1', whatsapp_integration_mode, NOW()
  FROM partners
  WHERE id = '4ba747b0-827c-48de-b148-70e7a573564a';

  -- 2. Clone categories and build old->new ID mapping
  FOR r IN SELECT * FROM category WHERE partner_id = '4ba747b0-827c-48de-b148-70e7a573564a' LOOP
    new_cat_id := gen_random_uuid();
    INSERT INTO category (id, name, partner_id, priority, deletion_status, is_active)
    VALUES (new_cat_id, r.name, new_partner_id, r.priority, r.deletion_status, r.is_active);
    cat_map := cat_map || jsonb_build_object(r.id::text, new_cat_id::text);
  END LOOP;

  -- 3. Clone menu items with remapped category IDs
  FOR r IN SELECT * FROM menu WHERE partner_id = '4ba747b0-827c-48de-b148-70e7a573564a' LOOP
    INSERT INTO menu (
      id, name, price, image_url, partner_id, image_source, category_id, description,
      is_top, deletion_status, is_available, priority, variants, is_price_as_per_size,
      is_veg, tags, delivery_price, show_on_delivery
    )
    VALUES (
      gen_random_uuid(), r.name, r.price, r.image_url, new_partner_id, r.image_source,
      (cat_map->>r.category_id::text)::uuid,
      r.description, r.is_top, r.deletion_status, r.is_available, r.priority, r.variants,
      r.is_price_as_per_size, r.is_veg, r.tags, r.delivery_price, r.show_on_delivery
    );
  END LOOP;

  RAISE NOTICE 'Cloned partner created with ID: % and username: downtree1', new_partner_id;
END $$;
