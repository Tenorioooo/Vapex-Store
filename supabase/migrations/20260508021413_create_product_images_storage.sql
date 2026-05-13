/*
  # Create Storage Bucket for Product Images

  1. Storage
    - Create `product-images` bucket (public, for product photos)
  2. Security
    - Allow authenticated users to upload images
    - Allow public read access to product images
*/

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
