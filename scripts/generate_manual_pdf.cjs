const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function createSystemManualPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);

  // Styling helper functions
  function setDarkHeader(title, subtitle, pageNum, totalPages) {
    // Top banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');
    
    // Gold Accent bar
    doc.setFillColor(234, 179, 8); // yellow-500
    doc.rect(0, 27, pageWidth, 1.5, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('GOLDHUNTER PRO', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('INSTITUTIONAL XAU/USD SUPPLY & DEMAND SYSTEM MANUAL', margin, 18);

    doc.setFontSize(7);
    doc.setTextColor(234, 179, 8);
    doc.text(subtitle.toUpperCase(), margin, 24);

    // Page indicator
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`PAGE ${pageNum} OF ${totalPages}`, pageWidth - margin - 22, 16);

    // Bottom footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('GoldHunter Pro — Proprietary Institutional Trading Algorithm & Rulebook', margin, pageHeight - 8);
    doc.text('Confidential & Educational Material', pageWidth - margin - 45, pageHeight - 8);
  }

  // ================= PAGE 1 =================
  setDarkHeader('GOLDHUNTER PRO', 'PART 1: CORE FOUNDATION & MARKET MECHANICS', 1, 3);
  let y = 36;

  // Title block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('INSTITUTIONAL TRADING SYSTEM MANUAL', margin, y);
  y += 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('The Complete Mathematical & Algorithmic Blueprint for Trading XAU/USD (Gold)', margin, y);
  y += 10;

  // Section 1: Executive Summary
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(202, 138, 4);
  doc.text('EXECUTIVE PRINCIPLE: THE SYSTEM DOES NOT TRADE FAIR VALUE', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const execText = 'GoldHunter Pro operates on a fundamental market truth: when price is in equilibrium (Fair Value), buy and sell orders match and no institutional edge exists. The system ONLY generates trading signals at EXTREME HIGHS (where supply overwhelms demand) and EXTREME LOWS (where demand overwhelms supply), exiting trades when price returns to Fair Value.';
  doc.text(doc.splitTextToSize(execText, contentWidth - 8), margin + 4, y + 11);
  y += 30;

  // Section 2: The 4 Invariable Laws of Market Mechanics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. THE FOUR LAWS OF MARKET MECHANICS', margin, y);
  y += 5;

  const laws = [
    {
      q: 'A) What causes price to turn?',
      a: 'UNFILLED ORDERS. When price enters a level with massive institutional resting limit orders that exceed market participants on the other side, price cannot penetrate further and reverses violently.'
    },
    {
      q: 'B) Where will price turn to?',
      a: 'AREAS OF SIGNIFICANT SUPPLY & DEMAND IMBALANCE. Price travels directly toward the nearest unmitigated pool of institutional liquidity where pending liquidity remains.'
    },
    {
      q: 'C) Where will price move to next?',
      a: 'AREAS THAT LACK SIGNIFICANT IMBALANCE. Price easily traverses "vacuum" zones where resting orders are thin, seeking liquidity at the next extreme boundary.'
    },
    {
      q: 'D) What facilitates price movement?',
      a: 'ORDERS THAT HAVE ALREADY BEEN FILLED (MITIGATED ZONES). Once a zone has absorbed its resting orders, it offers no friction against future price movement, allowing smooth continuation.'
    }
  ];

  laws.forEach(law => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(law.q, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(law.a, contentWidth - 8), margin + 4, y + 10);
    y += 21;
  });

  y += 4;
  // Section 3: Timeframe Architecture
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. MULTI-TIMEFRAME STRUCTURE (4H DOWN TO 5M)', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const tfText = '• 4H / 1H (Higher Timeframe - HTF): Establishes institutional macro bias and locates extreme Supply and Demand blocks where commercial banks and hedge funds trade.\n• 15M / 5M (Lower Timeframe - LTF): Used exclusively for precision timing, liquidity sweeps, structural confirmation (CHoCH), and entry optimization.';
  doc.text(doc.splitTextToSize(tfText, contentWidth), margin, y);

  // ================= PAGE 2 =================
  doc.addPage();
  setDarkHeader('GOLDHUNTER PRO', 'PART 2: HIGH-PROBABILITY ZONES & DEPARTURE SPEED', 2, 3);
  y = 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. IDENTIFYING HIGH-PROBABILITY SUPPLY & DEMAND ZONES', margin, y);
  y += 6;

  // The 5-Candle Rule Box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(217, 119, 6);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(146, 64, 14);
  doc.text('★ THE GOLDEN RULE OF DEPARTURE TIME: 5 CANDLES OR LESS', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  const depText = '• THE LESS TIME price spends at a certain price level, the MORE out of balance supply and demand is at that level. A rapid departure in 1 to 5 candles confirms institutional aggression with substantial leftover unfilled orders.\n• THE MORE TIME price spends at a level (> 5 candles), the LESS out of balance it is. Prolonged consolidation represents two-sided order matching (fair value) and must NEVER be traded as an extreme zone.';
  doc.text(doc.splitTextToSize(depText, contentWidth - 8), margin + 4, y + 13);
  y += 40;

  // Visual Comparison Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('ZONE CLASSIFICATION MATRIX', margin, y);
  y += 4;

  // Table header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ZONE CRITERIA', margin + 3, y + 5);
  doc.text('DEPARTURE SPEED', margin + 50, y + 5);
  doc.text('IMBALANCE STATE', margin + 95, y + 5);
  doc.text('SYSTEM ACTION', margin + 140, y + 5);
  y += 7;

  const rows = [
    ['Extreme High (Fresh Supply)', '≤ 5 Explosive Candles', 'Massive Unfilled Sells', 'MONITOR FOR SHORT'],
    ['Extreme Low (Fresh Demand)', '≤ 5 Explosive Candles', 'Massive Unfilled Buys', 'MONITOR FOR LONG'],
    ['Mid-Range Consolidation', '> 6 Candles (Churn)', 'Equilibrium / Fair Value', 'STRICT NO-TRADE'],
    ['Mitigated / Tested Level', 'Price already swept level', 'Orders Absorbed', 'INVALIDATED']
  ];

  rows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(r[0], margin + 3, y + 5);
    doc.text(r[1], margin + 50, y + 5);
    doc.text(r[2], margin + 95, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(idx < 2 ? 22 : 185, idx < 2 ? 101 : 28, idx < 2 ? 52 : 28);
    doc.text(r[3], margin + 140, y + 5);
    y += 7;
  });

  y += 10;

  // Lower Timeframe Execution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. LOWER TIMEFRAME EXECUTION PROTOCOL (15M & 5M)', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Once price reaches a qualified 4H/1H Extreme Zone, four consecutive confirmations MUST occur before entry:', margin, y);
  y += 7;

  const steps = [
    {
      title: 'CRITERION 1: LIQUIDITY SWEEP',
      desc: 'Smart money probes past recent retail highs/lows with an extended wick to trigger stop losses and capture buy-side/sell-side liquidity before reversing.'
    },
    {
      title: 'CRITERION 2: CHANGE OF CHARACTER (CHoCH)',
      desc: 'The lower timeframe market structure shifts decisively. For a SELL: 5M body closes below the previous swing low. For a BUY: 5M body closes above the previous swing high.'
    },
    {
      title: 'CRITERION 3: THE TRIPLE-CANDLE ENGULFING PATTERN',
      desc: '• BUY SETUP: Exactly 1 powerful Bullish (Green) candle must fully engulf the real bodies of the previous THREE Bearish (Red) candles.\n• SELL SETUP: Exactly 1 powerful Bearish (Red) candle must fully engulf the real bodies of the previous THREE Bullish (Green) candles.'
    },
    {
      title: 'CRITERION 4: RETEST CONFIRMATION',
      desc: 'DO NOT chase market orders on the close of the engulfing candle. The system waits for a retracement/retest into the newly formed 5M Order Block or 50% equilibrium level.'
    }
  ];

  steps.forEach(s => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 19, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(s.title, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(s.desc, contentWidth - 8), margin + 4, y + 10);
    y += 22;
  });

  // ================= PAGE 3 =================
  doc.addPage();
  setDarkHeader('GOLDHUNTER PRO', 'PART 3: RISK MANAGEMENT, EXITS & MT5 DEPLOYMENT', 3, 3);
  y = 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('5. EXIT PROTOCOL: CLOSING AT FAIR VALUE', margin, y);
  y += 6;

  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(5, 150, 105);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(4, 120, 87);
  doc.text('WHY THE SYSTEM EXITS AT FAIR VALUE (EQUILIBRIUM)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(6, 78, 59);
  const exitText = 'Amateur traders hold greedily hoping for infinite moves. Institutional algorithms exit at Fair Value (the 50% midpoint between the extreme swing highs and lows, or the opposite Fair Value Gap). At Fair Value, supply and demand reach temporary equilibrium — holding beyond this invites dangerous chop, pullbacks, and stop hunts.';
  doc.text(doc.splitTextToSize(exitText, contentWidth - 8), margin + 4, y + 12);
  y += 30;

  // Trade Execution Specifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('6. EXACT ORDER PLACEMENT SPECIFICATIONS', margin, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'FD');

  const specs = [
    '• ENTRY ORDER: Pending Limit Order (Buy Limit / Sell Limit) placed at the 50% retest of the engulfing block.',
    '• STOP LOSS (SELL): Placed 10–15 pips above the extreme wick high that produced the liquidity sweep.',
    '• STOP LOSS (BUY): Placed 10–15 pips below the extreme wick low that produced the liquidity sweep.',
    '• TAKE PROFIT 1: At the first internal Fair Value Gap (FVG) / 38.2% Fibonacci retracement (move SL to Break-Even).',
    '• TAKE PROFIT 2 (FINAL): Exactly at 50% Market Equilibrium (Fair Value). Close all remaining volume.',
    '• MAXIMUM RISK PER TRADE: Never exceed 1.0% to 2.0% of total account equity.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  specs.forEach((spec, i) => {
    doc.text(spec, margin + 4, y + 6 + (i * 6));
  });
  y += 48;

  // Section 7: Daily 5-Minute Execution Checklist
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('7. PRE-TRADE 6-POINT CHECKLIST', margin, y);
  y += 6;

  const checklist = [
    '[  ] 1. Is price at an Extreme High (Supply) or Extreme Low (Demand)? (Never in the middle)',
    '[  ] 2. Did the HTF zone demonstrate an explosive departure in 5 CANDLES OR LESS?',
    '[  ] 3. Has lower timeframe (5M/15M) liquidity been swept with a clear rejection wick?',
    '[  ] 4. Did 5M print a clean Change of Character (CHoCH) with a full candle body close?',
    '[  ] 5. Did a single candle completely engulf the bodies of the previous 3 candles?',
    '[  ] 6. Is your pending limit set on the RETEST with TP locked at Fair Value?'
  ];

  checklist.forEach((item, i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(item, margin + 2, y + (i * 5.5));
  });
  y += 40;

  // Save to file
  const buffer = doc.output('arraybuffer');
  return Buffer.from(buffer);
}

// Generate files
const pdfData = createSystemManualPDF();
const publicPath = path.join(__dirname, '../public/GoldHunter_Pro_System_Manual.pdf');
const rootPath = path.join(__dirname, '../GoldHunter_Pro_System_Manual.pdf');

fs.mkdirSync(path.dirname(publicPath), { recursive: true });
fs.writeFileSync(publicPath, pdfData);
fs.writeFileSync(rootPath, pdfData);

console.log('PDF System Manual generated successfully at:');
console.log('1.', publicPath);
console.log('2.', rootPath);
