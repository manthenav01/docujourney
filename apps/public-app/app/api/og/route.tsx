import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'default';
  const name = searchParams.get('name') || 'Immigrant Central';

  let title = 'H1B Visa Data Analytics Platform';
  let subtitle = 'Real-time immigration insights & employer analytics';

  if (type === 'company') {
    title = `${name} - H1B Sponsorship Data`;
    subtitle = 'Salary ranges, approval rates & visa trends';
  } else if (type === 'job') {
    title = `${name} - H1B Salary Data`;
    subtitle = 'Market rates, requirements & sponsorship info';
  } else if (type === 'city') {
    title = `${name} - H1B Jobs & Salaries`;
    subtitle = 'Local visa sponsors & market analysis';
  }

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
          backgroundColor: '#1e40af',
          backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: '#1e40af',
              }}
            >
              IC
            </div>
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Immigrant Central
          </div>
        </div>
        
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 20,
            maxWidth: '90%',
          }}
        >
          {title}
        </div>
        
        <div
          style={{
            fontSize: 36,
            color: '#e0e7ff',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          {subtitle}
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            fontSize: 24,
            color: '#cbd5e1',
          }}
        >
          usimmigrantcentral.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}