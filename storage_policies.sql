-- Run this in the Supabase SQL Editor for your CMI_Finan project

-- Enable Storage on objects
ALTER PUBLICATION supabase_realtime ADD TABLE storage.objects;

-- Give public access to read avatars
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Give public access to upload avatars
CREATE POLICY "Anyone can upload an avatar." 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

-- Give public access to update avatars
CREATE POLICY "Anyone can update an avatar." 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'avatars');

-- Give public access to read logos
CREATE POLICY "Logo images are publicly accessible." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'logos');

-- Give public access to upload logos
CREATE POLICY "Anyone can upload a logo." 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'logos');

-- Give public access to update logos
CREATE POLICY "Anyone can update a logo." 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'logos');
