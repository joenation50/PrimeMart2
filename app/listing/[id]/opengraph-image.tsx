// app/listing/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { createServerSupabase } from '@/lib/supabase';

export const runtime = 'edge';
export const alt = 'Listing preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('listings').select('title, price, images').eq('id', params.id).single();

  const title = data?.title || 'PrimeMart Listing';
  const price = data?.price ? `₦${data.price.toLocaleString()}` : '';
  const imageUrl = data?.images?.[0] 
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/${data.images[0]}`
    : null;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#fff' }}>
        {imageUrl && (
          <img src={imageUrl} alt={title} style={{ width: '60%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', width: imageUrl ? '40%' : '100%' }}>
          <h1 style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 20, lineHeight: 1.2 }}>{title}</h1>
          <p style={{ fontSize: 36, fontWeight: 'semibold', color: '#0f0f11' }}>{price}</p>
          <p style={{ marginTop: 'auto', fontSize: 24, color: '#666' }}>PrimeMart</p>
        </div>
      </div>
    ),
    { ...size }
  );
}