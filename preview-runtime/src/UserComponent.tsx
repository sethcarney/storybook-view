import { GeneralInfo } from "../data/generalInfo";
import Container from "./common/Container/Container";

export const Footer = (generalInfo: GeneralInfo) => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <Container size="xl">
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h3 className="font-medium text-gray-900 mb-3">{generalInfo.companyName}</h3>
            <div className="space-y-2 text-[rgb(89,89,89)] font-sans text-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a
                    href={generalInfo.contact.phoneUrl}
                    className="hover:text-gray-700 transition-colors"
                  >
                    {generalInfo.contact.phoneFormatted}
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{generalInfo.contact.faxFormatted}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a
                    href={generalInfo.contact.emailUrl}
                    className="hover:text-gray-700 transition-colors"
                  >
                    {generalInfo.contact.email}
                  </a>
                </div>
                {/* Address - Centered above copyright */}
                <div className="flex justify-center md:justify-start">
                  <div className="text-left">
                    <div className="flex px-8 md:px-0 items-center text-[rgb(89,89,89)] font-sans text-sm">
                      <svg
                        className="w-4 h-4 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <a
                        href={generalInfo.address.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-700 transition-colors"
                      >
                        {generalInfo.address.fullAddress}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright - Bottom center */}
          <div className="text-center">
            <p className="text-sm text-gray-600 font-sans">{generalInfo.legal.copyrightText}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
};
