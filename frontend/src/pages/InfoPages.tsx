import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { apiRequest } from '../lib/api';

export const AboutPage: React.FC = () => {
  const { settings } = useStore();
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-extrabold">About {settings.brand_name || 'Sadik'}</h1>
      <p className="leading-relaxed text-slate-600 dark:text-slate-300">
        Welcome to <strong>{settings.domain || 'sadik.com.bd'}</strong> — your trusted destination for
        curated electronics, fashion, home living, and lifestyle essentials in Bangladesh. Headquartered
        at {settings.address}, we combine strict quality verification with fast nationwide delivery.
      </p>
      <div className="grid gap-6 pt-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold">Curated Quality</h3>
          <p className="mt-1 text-sm text-slate-500">Every item is inspected before dispatch from our Dhaka hub.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold">Nationwide Delivery</h3>
          <p className="mt-1 text-sm text-slate-500">Fast courier coverage across all 64 districts of Bangladesh.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold">Customer First</h3>
          <p className="mt-1 text-sm text-slate-500">7-day easy returns and responsive support on {settings.phone}.</p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ message: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      showToast(res.message);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      showToast('Failed to send message.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold">Contact Us</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <span>{settings.address}</span>
            </p>
            <p className="flex items-center gap-3 text-sm">
              <Phone className="h-5 w-5 shrink-0 text-teal-600" />
              <span>{settings.phone}</span>
            </p>
            <p className="flex items-center gap-3 text-sm">
              <Mail className="h-5 w-5 shrink-0 text-teal-600" />
              <span>{settings.email || 'support@sadik.com.bd'}</span>
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <iframe
              title="Sadik Office Map"
              src={
                settings.google_map_embed_url ||
                'https://www.google.com/maps?q=58+Satmasjid+Road+Dhanmondi+Dhaka+Bangladesh&output=embed'
              }
              className="h-72 w-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-xl font-bold">Send a Message</h2>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-600"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export const FaqPage: React.FC = () => (
  <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
    <h1 className="mb-6 text-3xl font-extrabold">Frequently Asked Questions</h1>
    {[
      { q: 'How fast is delivery inside Dhaka?', a: 'Orders inside Dhaka are delivered within 24–48 hours.' },
      { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery, bKash, and Nagad.' },
      { q: 'Can I return a product?', a: 'Yes, unused items in original packaging can be returned within 7 days.' },
    ].map((item, i) => (
      <div
        key={i}
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <h3 className="font-bold">{item.q}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
      </div>
    ))}
  </div>
);

export const PolicyPage: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
    <h1 className="text-3xl font-extrabold">{title}</h1>
    <p className="leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
  </div>
);
