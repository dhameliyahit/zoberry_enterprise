import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { Phone, Mail, MapPin, MessageCircle, Check, ArrowRight } from 'lucide-react';
import { Card, CardBody, Button, Input } from '../components/ui';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title="Contact Us | Zoberry Enterprise"
        description="Get in touch with Zoberry Enterprise customer support for orders, product queries, and wholesale inquiries."
        url="/contact"
      />
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <Card className="p-8 md:p-12 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
            Customer Support
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Contact Zoberry Enterprise
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mb-8 leading-relaxed">
            Have questions about a product, delivery, or custom order? Our support team is here to assist you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Phone Support</h3>
                  <p className="text-slate-600 text-xs mt-0.5">+91 96386 01192</p>
                  <p className="text-[11px] text-slate-400">Mon - Sat, 10:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">WhatsApp Support</h3>
                  <p className="text-slate-600 text-xs mt-0.5">Quick order updates & product queries</p>
                  <a
                    href="https://wa.me/919638601192"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Chat on WhatsApp <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Email Inquiries</h3>
                  <p className="text-slate-600 text-xs mt-0.5">support@zoberryenterprise.shop</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Warehouse Location</h3>
                  <p className="text-slate-600 text-xs mt-0.5">Surat, Gujarat, India</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">Message Sent!</h3>
                  <p className="text-xs text-slate-500">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <Input
                    label="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                  />
                  <Input
                    label="Phone / WhatsApp"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md" className="w-full">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
