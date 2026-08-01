'use client';

import { useState, type ReactNode } from 'react';

type IconName = 'home' | 'box' | 'game' | 'gift' | 'store' | 'mega' | 'phone' | 'cart' | 'moon' | 'login' | 'menu' | 'x' | 'external';

const flames = [
  [9, 20, 24], [24, 50, 18], [26, 48, 14], [33, 43, 28], [31, 67, 21], [40, 85, 16],
  [49, 20, 24], [54, 20, 25], [63, 25, 23], [84, 35, 24], [78, 46, 18], [68, 62, 20],
  [86, 83, 31], [91, 89, 17], [60, 91, 21], [49, 91, 29], [41, 92, 18], [18, 66, 20],
  [12, 60, 27], [17, 49, 21], [30, 55, 30], [43, 62, 22], [74, 77, 27], [81, 61, 18],
];

const menuItems: Array<{ icon?: IconName; label: string; section?: boolean }> = [
  { icon: 'home', label: 'หน้าหลัก' },
  { icon: 'box', label: 'สินค้า' },
  { label: 'สินค้าบริการอื่นๆ', section: true },
  { icon: 'game', label: 'มินิเกม' },
  { icon: 'gift', label: 'สุ่มหีบ' },
  { icon: 'store', label: 'Byshop' },
  { icon: 'mega', label: 'ปั้มโซเชียล' },
  { icon: 'phone', label: 'บริการ OTP / เช่าเบอร์' },
];

function Icon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></>,
    box: <><path d="M5 8h14l-1 12H6z"/><path d="M8 8a4 4 0 0 1 8 0"/></>,
    game: <><rect x="3" y="9" width="18" height="10" rx="3"/><path d="M8 14h4M10 12v4"/><circle cx="16" cy="14" r="1"/><circle cx="18.5" cy="12" r="1"/><path d="m15 9 3-4 3 2"/></>,
    gift: <><path d="M4 12h16v9H4z"/><path d="M3 8h18v4H3zM12 8v13"/><path d="M12 8C9 8 7 7 7 5.5S9.5 3 12 8Zm0 0c3 0 5-1 5-2.5S14.5 3 12 8Z"/></>,
    store: <><path d="M4 10h16l-1-5H5z"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/></>,
    mega: <><path d="M4 13h4l10-5v12L8 15H4z"/><path d="m8 15 2 6"/></>,
    phone: <><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></>,
    cart: <><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l3 12h11l2-8H7"/></>,
    moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>,
    login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    x: <><path d="M18 6 6 18M6 6l12 12"/></>,
    external: <><path d="M7 17 17 7M9 7h8v8"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

function Logo() {
  return <div className="logo-mark" aria-label="Penter Diwa logo"><span>PENTER</span><b>Diwa</b></div>;
}

export default function HomePage() {
  const [open, setOpen] = useState(false);
  return (
    <main className={open ? 'menu-is-open' : ''}>
      <header className="topbar">
        <div className="brand"><Logo /><span>Penter Diwa</span></div>
        <button className="plain-button menu-button" onClick={() => setOpen(true)} aria-label="เปิดเมนู"><Icon name="menu" /></button>
        <nav className="actions" aria-label="quick actions"><Icon name="cart" /><Icon name="moon" /><button className="login-button" aria-label="เข้าสู่ระบบ"><Icon name="login" /></button></nav>
      </header>
      <section className="hero" aria-label="Penter Diwa introduction">
        {flames.map(([left, top, size], index) => <span className="flame" style={{ left: `${left}%`, top: `${top}%`, fontSize: `${size}px` }} key={index}>🔥</span>)}
        <div className="source-pill">เปิดขาย <strong>source code</strong> นี้แล้วนะ <span></span><b>▦</b></div>
        <h1>ยินดีต้อนรับสู่ Penter Diwa</h1>
        <p>Penter Diwa คือระบบร้านค้าออนไลน์สำเร็จรูปสำหรับขายสินค้าดิจิทัล รองรับการชำระเงินอัตโนมัติ<br />จัดการสินค้าได้ง่าย พร้อมดีไซน์ทันสมัยและระบบหลังบ้านครบจบในที่เดียว</p>
        <div className="cta-row"><a className="primary-cta" href="#order"><Icon name="external" />สั่งซื้อโปรเจ็กต์</a><a className="secondary-cta" href="#rent">เช่าเว็บไซต์</a></div>
      </section>
      <button className="side-tab" aria-label="แถบด้านข้าง">‹</button>
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-panel">
          <button className="close-button" onClick={() => setOpen(false)} aria-label="ปิดเมนู"><Icon name="x" /></button>
          <div className="drawer-heading"><h2>เมนูทำรายการ</h2><span>🛰️ 🧝🏻‍♀️</span><p>Menu สำหรับทำรายการต่างๆ</p></div>
          <ul>{menuItems.map((item, index) => item.section ? <li className="section-title" key={index}>{item.label}</li> : <li key={index}>{item.icon && <Icon name={item.icon} />}<span>{item.label}</span></li>)}</ul>
        </div>
        <button className="drawer-backdrop" onClick={() => setOpen(false)} aria-label="ปิดเมนูพื้นหลัง" />
      </aside>
    </main>
  );
}
