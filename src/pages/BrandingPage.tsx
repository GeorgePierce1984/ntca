import React, { useState } from 'react';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import html2canvas from 'html2canvas';

const BrandingPage: React.FC = () => {
  const [downloadFormat, setDownloadFormat] = useState<'svg' | 'png'>('svg');

  // Brand colors with hex values
  const brandColors = [
    { name: 'Primary Blue', hex: '#3b82f6', rgb: 'rgb(59, 130, 246)', usage: 'Primary actions, links' },
    { name: 'Purple', hex: '#9333ea', rgb: 'rgb(147, 51, 234)', usage: 'Secondary accents, highlights' },
    { name: 'Amber', hex: '#f59e0b', rgb: 'rgb(245, 158, 11)', usage: 'Call-to-action, warnings' },
    { name: 'Sky Blue', hex: '#0ea5e9', rgb: 'rgb(14, 165, 233)', usage: 'Interactive elements' },
    { name: 'Dark Gray', hex: '#171717', rgb: 'rgb(23, 23, 23)', usage: 'Primary text, dark mode' },
    { name: 'Light Gray', hex: '#f5f5f5', rgb: 'rgb(245, 245, 245)', usage: 'Backgrounds, subtle borders' },
  ];

  const fonts = [
    { 
      name: 'Sora', 
      type: 'Display/Heading Font', 
      weights: '300, 400, 500, 600, 700, 800',
      usage: 'Headlines, titles, brand text',
      sample: 'The quick brown fox jumps over the lazy dog'
    },
    { 
      name: 'Inter', 
      type: 'Body Font', 
      weights: '300, 400, 500, 600, 700, 800, 900',
      usage: 'Body text, UI elements, navigation',
      sample: 'The quick brown fox jumps over the lazy dog'
    }
  ];

  const downloadLogo = async (format: 'svg' | 'png', size: number = 512) => {
    if (format === 'svg') {
      // Download SVG from assets
      const link = document.createElement('a');
      link.href = '/assets/ntca-logo.svg';
      link.download = 'ntca-logo.svg';
      link.click();
    } else {
      // Generate PNG from SVG
      try {
        // Create a temporary container with the SVG
        const container = document.createElement('div');
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
            <defs>
              <linearGradient id="ntcaGradPng" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="50%" stop-color="#9333ea"/>
                <stop offset="100%" stop-color="#f59e0b"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="60" height="60" rx="12" fill="url(#ntcaGradPng)"/>
            <g fill="#ffffff" opacity="0.95">
              <path d="M8 24 L32 12 L56 24 L32 36 Z" />
              <rect x="31" y="36" width="2" height="20" />
            </g>
          </svg>
        `;
        
        document.body.appendChild(container);
        
        // Convert to canvas
        const canvas = await html2canvas(container, {
          backgroundColor: null,
          scale: 1,
          useCORS: true,
        });
        
        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ntca-logo-${size}px.png`;
            link.click();
            URL.revokeObjectURL(link.href);
          }
        }, 'image/png');
        
        // Cleanup
        document.body.removeChild(container);
      } catch (error) {
        console.error('Error generating PNG:', error);
        alert('Error generating PNG. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container-custom py-20">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="heading-1 gradient-text mb-6">Brand Guidelines</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Official brand assets, colors, and typography guidelines for NexTeach Central Asia. 
              Download logos and learn how to properly represent our brand.
            </p>
          </div>

          {/* Logo Section */}
          <section className="mb-20">
            <div className="card p-8 mb-8">
              <h2 className="heading-2 mb-8">Logo</h2>
              
              <div className="grid lg:grid-cols-2 gap-12 mb-12">
                {/* Full Logo */}
                <div className="space-y-6">
                  <h3 className="heading-3">Full Logo</h3>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                    <Logo className="h-16" />
                  </div>
                  <div className="bg-gray-900 p-8 rounded-xl">
                    <Logo className="h-16" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use the full logo when there's sufficient space and brand recognition is important.
                  </p>
                </div>

                {/* Icon Only */}
                <div className="space-y-6">
                  <h3 className="heading-3">Icon Only</h3>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                    <LogoIcon className="h-16 w-16" />
                  </div>
                  <div className="bg-gray-900 p-8 rounded-xl">
                    <LogoIcon className="h-16 w-16" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use the icon for favicon, app icons, or when space is limited.
                  </p>
                </div>
              </div>

              {/* Download Section */}
              <div className="border-t pt-8">
                <h3 className="heading-3 mb-6">Download Assets</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Button 
                    onClick={() => downloadLogo('svg')}
                    className="btn-primary"
                  >
                    Download SVG
                  </Button>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">PNG Downloads:</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => downloadLogo('png', 64)}
                      className="btn-secondary text-sm"
                      size="sm"
                    >
                      64px PNG
                    </Button>
                    <Button 
                      onClick={() => downloadLogo('png', 128)}
                      className="btn-secondary text-sm"
                      size="sm"
                    >
                      128px PNG
                    </Button>
                    <Button 
                      onClick={() => downloadLogo('png', 256)}
                      className="btn-secondary text-sm"
                      size="sm"
                    >
                      256px PNG
                    </Button>
                    <Button 
                      onClick={() => downloadLogo('png', 512)}
                      className="btn-secondary text-sm"
                      size="sm"
                    >
                      512px PNG
                    </Button>
                    <Button 
                      onClick={() => downloadLogo('png', 1024)}
                      className="btn-secondary text-sm"
                      size="sm"
                    >
                      1024px PNG
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  SVG format is recommended for web use and scalability. PNG versions are generated on-demand in various sizes.
                </p>
              </div>
            </div>
          </section>

          {/* Colors Section */}
          <section className="mb-20">
            <div className="card p-8">
              <h2 className="heading-2 mb-8">Brand Colors</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brandColors.map((color, index) => (
                  <div key={index} className="group">
                    <div 
                      className="w-full h-32 rounded-xl mb-4 border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => navigator.clipboard.writeText(color.hex)}
                      title={`Click to copy ${color.hex}`}
                    />
                    <h3 className="font-semibold text-lg mb-2">{color.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {color.hex}
                      </p>
                      <p className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {color.rgb}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {color.usage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section className="mb-20">
            <div className="card p-8">
              <h2 className="heading-2 mb-8">Typography</h2>
              <div className="space-y-12">
                {fonts.map((font, index) => (
                  <div key={index}>
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="heading-3 mb-4">{font.name}</h3>
                        <div className="space-y-2 text-gray-600 dark:text-gray-400">
                          <p><span className="font-semibold">Type:</span> {font.type}</p>
                          <p><span className="font-semibold">Weights:</span> {font.weights}</p>
                          <p><span className="font-semibold">Usage:</span> {font.usage}</p>
                        </div>
                      </div>
                      <div>
                        <div 
                          className="text-2xl mb-4"
                          style={{ fontFamily: font.name === 'Sora' ? 'Sora, system-ui, sans-serif' : 'Inter, system-ui, sans-serif' }}
                        >
                          {font.sample}
                        </div>
                        <div className="space-y-2">
                          {[300, 400, 500, 600, 700].map(weight => (
                            <div 
                              key={weight}
                              className="text-lg"
                              style={{ 
                                fontFamily: font.name === 'Sora' ? 'Sora, system-ui, sans-serif' : 'Inter, system-ui, sans-serif',
                                fontWeight: weight
                              }}
                            >
                              Weight {weight}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Usage Guidelines */}
          <section className="mb-20">
            <div className="card p-8">
              <h2 className="heading-2 mb-8">Usage Guidelines</h2>
              <div className="grid lg:grid-cols-2 gap-12">
                
                {/* Do's */}
                <div>
                  <h3 className="heading-3 text-green-600 mb-6">✓ Do</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li>• Use the official logo files provided</li>
                    <li>• Maintain adequate spacing around the logo</li>
                    <li>• Use brand colors from the official palette</li>
                    <li>• Ensure good contrast for readability</li>
                    <li>• Keep typography consistent with brand fonts</li>
                    <li>• Scale logos proportionally</li>
                  </ul>
                </div>

                {/* Don'ts */}
                <div>
                  <h3 className="heading-3 text-red-600 mb-6">✗ Don't</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li>• Recreate or redraw the logo</li>
                    <li>• Change logo colors or add effects</li>
                    <li>• Stretch or distort the logo</li>
                    <li>• Use low resolution versions</li>
                    <li>• Place logo on busy backgrounds</li>
                    <li>• Use outdated brand assets</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="card p-8 text-center">
              <h2 className="heading-2 mb-4">Need More Assets?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                If you need additional brand assets, custom logo variations, or have questions about brand usage, 
                please don't hesitate to get in touch with our team.
              </p>
              <Button className="btn-primary">
                Contact Us
              </Button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default BrandingPage; 