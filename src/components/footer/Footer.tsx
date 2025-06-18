import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 left-0 w-full h-32 opacity-10"
          style={{ 
            background: `linear-gradient(135deg, hsl(260, 50%, 50%) 0%, hsl(280, 60%, 60%) 100%)`,
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 80%)'
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                style={{ backgroundColor: 'hsl(260, 50%, 50%)' }}
              >
                C
              </div>
              <span className="text-2xl font-bold text-gray-900">Company</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Building amazing digital experiences with modern technology and innovative design solutions for the future.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(260, 50%, 95%)' }}
                >
                  <Mail className="w-4 h-4" style={{ color: 'hsl(260, 50%, 50%)' }} />
                </div>
                <span>hello@company.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(260, 50%, 95%)' }}
                >
                  <Phone className="w-4 h-4" style={{ color: 'hsl(260, 50%, 50%)' }} />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(260, 50%, 95%)' }}
                >
                  <MapPin className="w-4 h-4" style={{ color: 'hsl(260, 50%, 50%)' }} />
                </div>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 relative">
              Services
              <div 
                className="absolute -bottom-2 left-0 w-8 h-1 rounded-full"
                style={{ backgroundColor: 'hsl(260, 50%, 50%)' }}
              />
            </h3>
            <ul className="space-y-3">
              {['Web Development', 'Mobile Apps', 'UI/UX Design', 'Digital Marketing', 'Consulting'].map((service) => (
                <li key={service}>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-all duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mr-3 group-hover:scale-125 transition-transform" 
                          style={{ backgroundColor: 'hsl(260, 50%, 50%)' }} />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 relative">
              Company
              <div 
                className="absolute -bottom-2 left-0 w-8 h-1 rounded-full"
                style={{ backgroundColor: 'hsl(260, 50%, 50%)' }}
              />
            </h3>
            <ul className="space-y-3">
              {['About Us', 'Our Team', 'Careers', 'News & Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-all duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mr-3 group-hover:scale-125 transition-transform" 
                          style={{ backgroundColor: 'hsl(260, 50%, 50%)' }} />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 relative">
              Stay Updated
              <div 
                className="absolute -bottom-2 left-0 w-8 h-1 rounded-full"
                style={{ backgroundColor: 'hsl(260, 50%, 50%)' }}
              />
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Subscribe to our newsletter for the latest updates and insights.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    '--tw-ring-color': 'hsl(260, 50%, 50%)',
                    '--tw-ring-offset-color': '#ffffff'
                  } as React.CSSProperties}
                />
                <Button 
                  className="text-white font-medium hover:opacity-90 transition-opacity whitespace-nowrap px-6"
                  style={{ backgroundColor: 'hsl(260, 50%, 50%)' }}
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Social Media */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' }
              ].map(({ icon: Icon, label }) => (
                <a 
                  key={label}
                  href="#" 
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                  style={{ 
                    backgroundColor: 'hsl(260, 50%, 95%)', 
                    color: 'hsl(260, 50%, 50%)' 
                  }}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>

            {/* Copyright & Links */}
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-8 text-sm text-gray-600">
              <span className="font-medium text-primary">© 2025 ExamFlowPro. All rights reserved</span>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookies'].map((link) => (
                  <a 
                    key={link}
                    href="#" 
                    className="hover:text-gray-900 transition-colors relative group"
                  >
                    {link}
                    <span 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                      style={{ backgroundColor: 'hsl(260, 50%, 50%)' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;