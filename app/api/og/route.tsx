import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'PrimeMart';
    const subtitle = searchParams.get('subtitle') || 'Shop at its prime.';
    const image = searchParams.get('image') || '';
    const link = searchParams.get('link') || 'primemartapp.name.ng';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #22c55e 2%, transparent 0%), radial-gradient(circle at 75px 75px, #22c55e 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Main Card Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '40px',
              padding: '40px',
              width: '900px',
              height: '500px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Left Side: Text Info */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                {/* PrimeMart Logo SVG */}
                <svg width="50" height="50" viewBox="0 0 400 300">
                  <g transform="translate(50, 50)">
                    <path d="M 0 0 L 80 0 L 120 40 L 120 100 L 80 140 L 40 140 L 40 180 L 0 180 Z" fill="#22c55e" />
                    <path d="M 40 40 L 80 40 L 80 100 L 40 100 Z" fill="#0a0a0a" />
                  </g>
                  <g transform="translate(180, 50)">
                    <path d="M 0 0 L 40 0 L 80 80 L 120 0 L 160 0 L 160 180 L 120 180 L 120 70 L 80 140 L 40 70 L 40 180 L 0 180 Z" fill="#22c55e" />
                  </g>
                </svg>
                <span style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', marginLeft: '15px' }}>PrimeMart</span>
              </div>
              
              <h1 style={{ color: 'white', fontSize: '56px', fontWeight: 900, lineHeight: 1.1, margin: 0, marginBottom: '20px' }}>
                {title}
              </h1>
              <p style={{ color: '#a1a1aa', fontSize: '28px', margin: 0, marginBottom: '40px' }}>
                {subtitle}
              </p>
              
              <div style={{ backgroundColor: '#22c55e', color: '#0a0a0a', padding: '12px 30px', borderRadius: '30px', fontSize: '24px', fontWeight: 'bold', width: 'fit-content' }}>
                {link}
              </div>
            </div>

            {/* Right Side: Image */}
            {image && (
              <div style={{ display: 'flex', width: '350px', height: '100%', borderRadius: '24px', overflow: 'hidden', border: '4px solid rgba(34, 197, 94, 0.3)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Mockup" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}