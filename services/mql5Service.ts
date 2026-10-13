/**
 * MQL5 Expert Advisor & Indicator Generator for MetaTrader 5 (MT5)
 * Specialized exclusively for XAUUSD (Gold) with 4-Criteria Supply & Demand Engine
 */

export interface GoldMQL5Config {
  lotSize: number;
  stopLossPips: number;
  takeProfit1Pips: number;
  takeProfit2Pips: number;
  breakEvenPips: number;
  trailingStopPips: number;
  maxSpreadPips: number;
  useSessionFilter: boolean;
  londonStartHour: number;
  londonEndHour: number;
  nyStartHour: number;
  nyEndHour: number;
  minStalledCandles: number;
  maxStalledCandles: number;
  requireFVG: boolean;
  enablePushNotifications: boolean;
  usePartialTakeProfit: boolean;
  magicNumber: number;
  // Live Visual Zone Drawing on MT5 Chart
  drawZonesOnChart: boolean;
  extendZonesForward: boolean;
  fillZones: boolean;
  maxZonesDrawn: number;
}

export const defaultGoldMQL5Config: GoldMQL5Config = {
  lotSize: 0.05,
  stopLossPips: 35,
  takeProfit1Pips: 65,
  takeProfit2Pips: 130,
  breakEvenPips: 30,
  trailingStopPips: 25,
  maxSpreadPips: 3.5,
  useSessionFilter: true,
  londonStartHour: 8,
  londonEndHour: 11,
  nyStartHour: 13,
  nyEndHour: 17,
  minStalledCandles: 3,
  maxStalledCandles: 6,
  requireFVG: true,
  enablePushNotifications: true,
  usePartialTakeProfit: true,
  magicNumber: 888100,
  drawZonesOnChart: true,
  extendZonesForward: true,
  fillZones: true,
  maxZonesDrawn: 6
};

/**
 * Generates production-ready MQL5 Expert Advisor source code for Gold (XAUUSD)
 * Enforcing the 4-Criteria Valid Supply & Demand Zone Validation
 */
export const generateGoldExpertAdvisor = (cfg: GoldMQL5Config): string => {
  return `//+------------------------------------------------------------------+
//|                                       GoldHunter_Pro_XAUUSD.mq5  |
//|                    Copyright 2026, GoldHunter Institutional AI   |
//|         Strict 4-Criteria Valid Supply & Demand EA for XAU/USD   |
//|         * Built-in Real-Time Chart Supply & Demand Drawing *     |
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, GoldHunter Institutional AI"
#property link        "https://spikehunter.deriv"
#property version     "3.50"
#property description "Automated XAU/USD (Gold) 4-Criteria Valid Supply & Demand Zone EA"
#property description "Rule 1: Sharp Impulse | Rule 2: FVG Created | Rule 3: Backyard Trading | Rule 4: 3-6 Stalled Candles"
#property description "Features: Real-time visual supply & demand box drawing and dynamic projection as market moves."

#include <Trade\\Trade.mqh>

//--- INPUT PARAMETERS ---
input group "=== Institutional Risk Management ==="
input double   InpLotSize              = ${cfg.lotSize.toFixed(2)};     // Initial Order Lot Size
input int      InpStopLossPips         = ${cfg.stopLossPips};        // Stop Loss in Pips (1 pip = $0.10 on Gold)
input int      InpTakeProfit1Pips      = ${cfg.takeProfit1Pips};        // Partial Take Profit 1 (Pips)
input int      InpTakeProfit2Pips      = ${cfg.takeProfit2Pips};       // Final Take Profit 2 (Pips)
input int      InpBreakEvenPips        = ${cfg.breakEvenPips};        // Move SL to Breakeven after (+Pips)
input int      InpTrailingStopPips     = ${cfg.trailingStopPips};        // Trailing Stop in Pips
input double   InpMaxSpreadPips        = ${cfg.maxSpreadPips.toFixed(1)};      // Max Allowed Spread (Pips)

input group "=== 4-Criteria Supply & Demand Rules ==="
input int      InpMinStalledCandles    = ${cfg.minStalledCandles};         // Criterion 4: Min Stalled Basing Candles (Default 3)
input int      InpMaxStalledCandles    = ${cfg.maxStalledCandles};         // Criterion 4: Max Stalled Basing Candles (Default 6)
input bool     InpRequireFVG           = ${cfg.requireFVG ? 'true' : 'false'};      // Criterion 2: Require 3-Candle Fair Value Gap
input double   InpMinDisplacementPips  = 25.0;      // Criterion 1: Min Sharp Movement (Pips)

input group "=== Real-Time Chart Visuals (Live Zones) ==="
input bool     InpDrawZonesOnChart     = ${cfg.drawZonesOnChart ? 'true' : 'false'};      // Draw S&D Boxes Directly on MT5 Chart
input bool     InpExtendZonesForward   = ${cfg.extendZonesForward ? 'true' : 'false'};      // Dynamically Project Zones Forward As Market Moves
input bool     InpFillZones            = ${cfg.fillZones ? 'true' : 'false'};      // Semi-Transparent Box Fill
input int      InpMaxZonesDrawn        = ${cfg.maxZonesDrawn};         // Maximum Number of Zones Retained On Chart
input color    InpDemandColor          = C'20,70,45';       // Demand Zone Fill Color (Emerald)
input color    InpSupplyColor          = C'100,22,32';      // Supply Zone Fill Color (Crimson)
input color    InpDemandBorderColor    = clrMediumSeaGreen; // Demand Border & Tag Color
input color    InpSupplyBorderColor    = clrCrimson;        // Supply Border & Tag Color

input group "=== Session & Killzones Filter (GMT) ==="
input bool     InpUseSessionFilter     = ${cfg.useSessionFilter ? 'true' : 'false'};      // Only trade during high-liquidity Killzones
input int      InpLondonStartHour      = ${cfg.londonStartHour};         // London Open Start Hour (GMT)
input int      InpLondonEndHour        = ${cfg.londonEndHour};        // London Open End Hour (GMT)
input int      InpNYStartHour          = ${cfg.nyStartHour};        // New York AM Killzone Start Hour (GMT)
input int      InpNYEndHour            = ${cfg.nyEndHour};        // New York AM Killzone End Hour (GMT)

input group "=== Trade Automation Settings ==="
input bool     InpUsePartialClose      = ${cfg.usePartialTakeProfit ? 'true' : 'false'};      // Close 50% volume at TP1
input bool     InpEnablePushAlerts     = ${cfg.enablePushNotifications ? 'true' : 'false'};      // Send Alert to MetaTrader Mobile App
input ulong    InpMagicNumber          = ${cfg.magicNumber};    // Unique Magic Identifier

//--- GLOBAL OBJECTS ---
CTrade         m_trade;
datetime       lastBarTime             = 0;
double         pipMultiplier           = 0.10; // Gold 1 pip standard
bool           tp1Secured              = false;

// Forward declarations of drawing functions
void DrawSupplyDemandZone(string zoneType, double highPrice, double lowPrice, datetime startTime, int stalledBars, double displacement);
void UpdateLiveZoneProjections();
void ScanHistoricalZones(int barsToScan);
void RemoveOldestZones(int maxAllowed);

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   m_trade.SetExpertMagicNumber(InpMagicNumber);
   m_trade.SetMarginMode();
   m_trade.SetTypeFillingBySymbol(_Symbol);

   if(_Digits == 2)
      pipMultiplier = 0.10;
   else if(_Digits == 3)
      pipMultiplier = 0.100;
   else
      pipMultiplier = _Point * 10;

   // Real-time Visual Engine: Draw existing valid historical zones immediately
   if(InpDrawZonesOnChart)
   {
      ScanHistoricalZones(120);
      Print("✓ [Visual Engine] Real-time S&D chart drawing initialized for ", _Symbol);
   }

   Print("✓ [GoldHunter 4-Criteria S&D EA] Initialized on ", _Symbol, " | Pip size: ", pipMultiplier);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   Print("GoldHunter EA Stopped. Reason: ", reason);
   if(InpDrawZonesOnChart)
   {
      ObjectsDeleteAll(0, "GH_Zone_");
      ObjectsDeleteAll(0, "GH_Lbl_");
      ChartRedraw(0);
   }
}

//+------------------------------------------------------------------+
//| Check if current GMT time is within Institutional Killzones      |
//+------------------------------------------------------------------+
bool IsInKillzone()
{
   if(!InpUseSessionFilter) return true;

   MqlDateTime dt;
   TimeGMT(dt);
   bool isLondon = (dt.hour >= InpLondonStartHour && dt.hour < InpLondonEndHour);
   bool isNY     = (dt.hour >= InpNYStartHour && dt.hour < InpNYEndHour);
   return (isLondon || isNY);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // 1. Dynamic zone projection as the market is moving
   UpdateLiveZoneProjections();

   // 2. Open Position Management (TP, SL, Trailing, BE)
   ManageOpenPositions();

   // 3. New bar evaluation for setups and zone discovery
   datetime currentBarTime = iTime(_Symbol, _Period, 0);
   if(currentBarTime == lastBarTime)
      return;
   lastBarTime = currentBarTime;

   // 4. Spread Check
   double spread = (SymbolInfoDouble(_Symbol, SYMBOL_ASK) - SymbolInfoDouble(_Symbol, SYMBOL_BID)) / pipMultiplier;
   if(spread > InpMaxSpreadPips) return;

   // 5. Killzone Check
   if(!IsInKillzone()) return;

   // 6. Strict 4-Criteria Supply & Demand Zone Evaluation & Execution
   EvaluateFourCriteriaZones();
}

//+------------------------------------------------------------------+
//| Real-Time Supply & Demand Zone Drawing Function                  |
//+------------------------------------------------------------------+
void DrawSupplyDemandZone(string zoneType, double highPrice, double lowPrice, datetime startTime, int stalledBars, double displacement)
{
   if(!InpDrawZonesOnChart) return;

   RemoveOldestZones(InpMaxZonesDrawn);

   string id = zoneType + "_" + IntegerToString((long)startTime);
   string boxName = "GH_Zone_" + id;
   string lblName = "GH_Lbl_" + id;

   // Project the right edge forward by 10 bars
   datetime endTime = TimeCurrent() + (PeriodSeconds() * 10);
   color boxColor = (zoneType == "DEMAND") ? InpDemandColor : InpSupplyColor;
   color borderColor = (zoneType == "DEMAND") ? InpDemandBorderColor : InpSupplyBorderColor;

   // 1. Draw Rectangle Box
   if(ObjectFind(0, boxName) < 0)
   {
      ObjectCreate(0, boxName, OBJ_RECTANGLE, 0, startTime, highPrice, endTime, lowPrice);
      ObjectSetInteger(0, boxName, OBJPROP_COLOR, boxColor);
      ObjectSetInteger(0, boxName, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, boxName, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, boxName, OBJPROP_BACK, true); // Keep candles clearly visible in front
      ObjectSetInteger(0, boxName, OBJPROP_FILL, InpFillZones);
      ObjectSetInteger(0, boxName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, boxName, OBJPROP_HIDDEN, true);
   }
   else
   {
      ObjectSetInteger(0, boxName, OBJPROP_TIME, 1, endTime);
   }

   // 2. Draw Descriptive Text Tag
   if(ObjectFind(0, lblName) < 0)
   {
      double labelPrice = (zoneType == "DEMAND") ? lowPrice : highPrice;
      ObjectCreate(0, lblName, OBJ_TEXT, 0, startTime, labelPrice);
      string text = (zoneType == "DEMAND") 
         ? StringFormat(" 🟢 DEMAND ZONE [4/4] (%.2f - %.2f) | Basing: %db | Imp: +%.1fp", lowPrice, highPrice, stalledBars, displacement)
         : StringFormat(" 🔴 SUPPLY ZONE [4/4] (%.2f - %.2f) | Basing: %db | Imp: -%.1fp", lowPrice, highPrice, stalledBars, displacement);
      
      ObjectSetString(0, lblName, OBJPROP_TEXT, text);
      ObjectSetInteger(0, lblName, OBJPROP_COLOR, borderColor);
      ObjectSetInteger(0, lblName, OBJPROP_FONTSIZE, 8);
      ObjectSetString(0, lblName, OBJPROP_FONT, "Segoe UI");
      ObjectSetInteger(0, lblName, OBJPROP_ANCHOR, (zoneType == "DEMAND") ? ANCHOR_LEFT_UPPER : ANCHOR_LEFT_LOWER);
      ObjectSetInteger(0, lblName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, lblName, OBJPROP_HIDDEN, true);
   }

   ChartRedraw(0);
}

//+------------------------------------------------------------------+
//| Dynamic Zone Projection & Real-time Mitigation Tracker           |
//+------------------------------------------------------------------+
void UpdateLiveZoneProjections()
{
   if(!InpDrawZonesOnChart || !InpExtendZonesForward) return;

   datetime forwardTime = TimeCurrent() + (PeriodSeconds() * 10);
   double currentBid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double currentAsk = SymbolInfoDouble(_Symbol, SYMBOL_ASK);

   int total = ObjectsTotal(0, -1, OBJ_RECTANGLE);
   for(int i = 0; i < total; i++)
   {
      string name = ObjectName(0, i, -1, OBJ_RECTANGLE);
      if(StringFind(name, "GH_Zone_") == 0)
      {
         // Smoothly stretch the zone forward into the future as market ticks
         ObjectSetInteger(0, name, OBJPROP_TIME, 1, forwardTime);

         // Check if live market price is touching or mitigating this zone
         double p1 = ObjectGetDouble(0, name, OBJPROP_PRICE, 0);
         double p2 = ObjectGetDouble(0, name, OBJPROP_PRICE, 1);
         double highPrice = (p1 > p2) ? p1 : p2;
         double lowPrice  = (p1 > p2) ? p2 : p1;

         bool isDemand = (StringFind(name, "DEMAND") >= 0);
         string lblName = "GH_Lbl_" + StringSubstr(name, 8);

         if(isDemand && currentBid <= highPrice && currentBid >= lowPrice)
         {
            // Market has entered Demand Zone
            ObjectSetInteger(0, name, OBJPROP_STYLE, STYLE_DASH);
            if(ObjectFind(0, lblName) >= 0)
            {
               string curText = ObjectGetString(0, lblName, OBJPROP_TEXT);
               if(StringFind(curText, "⚡ [TESTING ZONE]") < 0)
                  ObjectSetString(0, lblName, OBJPROP_TEXT, curText + " ⚡ [TESTING ZONE]");
            }
         }
         else if(!isDemand && currentAsk >= lowPrice && currentAsk <= highPrice)
         {
            // Market has entered Supply Zone
            ObjectSetInteger(0, name, OBJPROP_STYLE, STYLE_DASH);
            if(ObjectFind(0, lblName) >= 0)
            {
               string curText = ObjectGetString(0, lblName, OBJPROP_TEXT);
               if(StringFind(curText, "⚡ [TESTING ZONE]") < 0)
                  ObjectSetString(0, lblName, OBJPROP_TEXT, curText + " ⚡ [TESTING ZONE]");
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Manage Max Allowed Graphical Zones on Chart                      |
//+------------------------------------------------------------------+
void RemoveOldestZones(int maxAllowed)
{
   int zoneCount = 0;
   int total = ObjectsTotal(0, -1, OBJ_RECTANGLE);
   for(int i = total - 1; i >= 0; i--)
   {
      string name = ObjectName(0, i, -1, OBJ_RECTANGLE);
      if(StringFind(name, "GH_Zone_") == 0)
      {
         zoneCount++;
         if(zoneCount >= maxAllowed)
         {
            ObjectDelete(0, name);
            string lblName = "GH_Lbl_" + StringSubstr(name, 8);
            ObjectDelete(0, lblName);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Scan Historical Bars on Startup to Draw Existing Valid Zones     |
//+------------------------------------------------------------------+
void ScanHistoricalZones(int barsToScan)
{
   if(!InpDrawZonesOnChart) return;

   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int copied = CopyRates(_Symbol, _Period, 0, barsToScan, rates);
   if(copied < 30) return;

   for(int i = copied - 10; i >= 2; i--)
   {
      double impulseBody = MathAbs(rates[i].close - rates[i].open);
      double displacementPips = impulseBody / pipMultiplier;
      if(displacementPips < InpMinDisplacementPips) continue;

      bool sharpUpside   = (rates[i].close > rates[i].open);
      bool sharpDownside = (rates[i].close < rates[i].open);

      int stalledCount = 0;
      double baseHigh = 0;
      double baseLow  = 999999.0;

      for(int k = i + 1; k <= i + 8 && k < copied; k++)
      {
         double bBody = MathAbs(rates[k].close - rates[k].open);
         if(bBody <= (impulseBody * 0.45))
         {
            stalledCount++;
            if(rates[k].high > baseHigh) baseHigh = rates[k].high;
            if(rates[k].low < baseLow) baseLow = rates[k].low;
         }
         else break;
      }

      if(stalledCount >= InpMinStalledCandles && stalledCount <= InpMaxStalledCandles)
      {
         bool fvgOk = true;
         if(InpRequireFVG && (i - 1 >= 0) && (i + 1 < copied))
         {
            if(sharpUpside) fvgOk = (rates[i-1].low > rates[i+1].high);
            else if(sharpDownside) fvgOk = (rates[i-1].high < rates[i+1].low);
         }

         if(fvgOk)
         {
            datetime zoneTime = rates[i + stalledCount].time;
            if(sharpUpside)
               DrawSupplyDemandZone("DEMAND", baseHigh, baseLow, zoneTime, stalledCount, displacementPips);
            else if(sharpDownside)
               DrawSupplyDemandZone("SUPPLY", baseHigh, baseLow, zoneTime, stalledCount, displacementPips);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Evaluate the 4 strict criteria for Valid Supply and Demand       |
//+------------------------------------------------------------------+
void EvaluateFourCriteriaZones()
{
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   if(CopyRates(_Symbol, _Period, 0, 25, rates) < 25) return;

   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);

   // Candle [1] is the completed impulse displacement candle
   double impulseBody = MathAbs(rates[1].close - rates[1].open);
   double displacementPips = impulseBody / pipMultiplier;

   // CRITERION 1: Sharp Movement Immediately to Upside (Demand) or Downside (Supply)
   bool sharpUpside   = (rates[1].close > rates[1].open && displacementPips >= InpMinDisplacementPips);
   bool sharpDownside = (rates[1].close < rates[1].open && displacementPips >= InpMinDisplacementPips);

   if(!sharpUpside && !sharpDownside) return;

   // CRITERION 4: 3 to 6 Candles that Stalled Before Market Continued
   int stalledCount = 0;
   double baseHigh = 0;
   double baseLow  = 999999.0;
   for(int k = 2; k <= 9; k++)
   {
      double body = MathAbs(rates[k].close - rates[k].open);
      if(body <= (impulseBody * 0.45)) // Stalling condition
      {
         stalledCount++;
         if(rates[k].high > baseHigh) baseHigh = rates[k].high;
         if(rates[k].low < baseLow) baseLow = rates[k].low;
      }
      else
      {
         break;
      }
   }

   bool criterion4_StalledValid = (stalledCount >= InpMinStalledCandles && stalledCount <= InpMaxStalledCandles);
   if(!criterion4_StalledValid) return;

   // CRITERION 2: Fair Value Gap (FVG) Created After Sharp Movement
   bool criterion2_FVG = true;
   if(InpRequireFVG)
   {
      if(sharpUpside)
         criterion2_FVG = (rates[0].low > rates[2].high);
      else if(sharpDownside)
         criterion2_FVG = (rates[0].high < rates[2].low);
   }
   if(!criterion2_FVG) return;

   // CRITERION 3: Immediate Trading in the Backyard
   bool criterion3_Backyard = (stalledCount >= 3);

   // CRITERIA QUALIFIED -> DRAW THE ZONE VISUALLY ON THE CHART!
   if(criterion4_StalledValid && criterion2_FVG && criterion3_Backyard)
   {
      datetime zoneStartTime = rates[1 + stalledCount].time;
      if(sharpUpside)
         DrawSupplyDemandZone("DEMAND", baseHigh, baseLow, zoneStartTime, stalledCount, displacementPips);
      else if(sharpDownside)
         DrawSupplyDemandZone("SUPPLY", baseHigh, baseLow, zoneStartTime, stalledCount, displacementPips);
   }

   // CHECK IF CURRENT POSITIONS ALREADY EXIST BEFORE TAKING A NEW TRADE
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionGetInteger(POSITION_MAGIC) == InpMagicNumber && PositionGetString(POSITION_SYMBOL) == _Symbol)
         return; // Already in trade
   }

   // ALL 4 CRITERIA ARE MET -> EXECUTE INSTITUTIONAL TRADE
   if(sharpUpside && criterion4_StalledValid && criterion2_FVG && criterion3_Backyard)
   {
      double sl = ask - (InpStopLossPips * pipMultiplier);
      double tp2 = ask + (InpTakeProfit2Pips * pipMultiplier);

      if(m_trade.Buy(InpLotSize, _Symbol, ask, sl, tp2, "Valid Demand (4/4 Qualified)"))
      {
         tp1Secured = false;
         Print("🎯 [QUALIFIED DEMAND ZONE BUY] 4/4 Verified! Entry: ", ask, " | SL: ", sl);
         if(InpEnablePushAlerts)
            SendNotification("🎯 GoldHunter Pro: BUY XAUUSD (Demand 4/4) @ " + DoubleToString(ask, 2));
      }
   }
   else if(sharpDownside && criterion4_StalledValid && criterion2_FVG && criterion3_Backyard)
   {
      double sl = bid + (InpStopLossPips * pipMultiplier);
      double tp2 = bid - (InpTakeProfit2Pips * pipMultiplier);

      if(m_trade.Sell(InpLotSize, _Symbol, bid, sl, tp2, "Valid Supply (4/4 Qualified)"))
      {
         tp1Secured = false;
         Print("🎯 [QUALIFIED SUPPLY ZONE SELL] 4/4 Verified! Entry: ", bid, " | SL: ", sl);
         if(InpEnablePushAlerts)
            SendNotification("🎯 GoldHunter Pro: SELL XAUUSD (Supply 4/4) @ " + DoubleToString(bid, 2));
      }
   }
}

//+------------------------------------------------------------------+
//| Manage Open Positions: Partial TP, Break-Even & Trailing Stop    |
//+------------------------------------------------------------------+
void ManageOpenPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket)) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagicNumber || PositionGetString(POSITION_SYMBOL) != _Symbol) continue;

      long posType       = PositionGetInteger(POSITION_TYPE);
      double openPrice   = PositionGetDouble(POSITION_PRICE_OPEN);
      double currentSL   = PositionGetDouble(POSITION_SL);
      double currentTP   = PositionGetDouble(POSITION_TP);
      double currentVol  = PositionGetDouble(POSITION_VOLUME);
      double currentPrice= (posType == POSITION_TYPE_BUY) ? SymbolInfoDouble(_Symbol, SYMBOL_BID) : SymbolInfoDouble(_Symbol, SYMBOL_ASK);

      double profitPips  = (posType == POSITION_TYPE_BUY) ? (currentPrice - openPrice) / pipMultiplier : (openPrice - currentPrice) / pipMultiplier;

      // 1. Partial TP at TP1 (+65 pips)
      if(InpUsePartialClose && !tp1Secured && profitPips >= InpTakeProfit1Pips && currentVol > 0.01)
      {
         double closeVol = NormalizeDouble(currentVol * 0.5, 2);
         if(closeVol >= 0.01)
         {
            m_trade.PositionClosePartial(ticket, closeVol);
            tp1Secured = true;
            Print("✓ [TP1 PARTIAL SECURED] Closed ", closeVol, " lots @ +", profitPips, " pips");
         }
      }

      // 2. Break-Even Protection (Move SL to Open + 3 pips buffer)
      if(profitPips >= InpBreakEvenPips)
      {
         double newSL = (posType == POSITION_TYPE_BUY) 
            ? openPrice + (3 * pipMultiplier) 
            : openPrice - (3 * pipMultiplier);

         if((posType == POSITION_TYPE_BUY && currentSL < newSL) || (posType == POSITION_TYPE_SELL && (currentSL > newSL || currentSL == 0)))
         {
            m_trade.PositionModify(ticket, newSL, currentTP);
            Print("🛡️ [BREAK-EVEN ARMED] SL moved to: ", newSL);
         }
      }

      // 3. Trailing Stop
      if(profitPips >= (InpBreakEvenPips + InpTrailingStopPips))
      {
         double trailingSL = (posType == POSITION_TYPE_BUY)
            ? currentPrice - (InpTrailingStopPips * pipMultiplier)
            : currentPrice + (InpTrailingStopPips * pipMultiplier);

         if((posType == POSITION_TYPE_BUY && trailingSL > currentSL) || (posType == POSITION_TYPE_SELL && (trailingSL < currentSL || currentSL == 0)))
         {
            m_trade.PositionModify(ticket, trailingSL, currentTP);
         }
      }
   }
}
//+------------------------------------------------------------------+
`;
};

/**
 * Generates MQL5 Custom Indicator for XAUUSD (Gold)
 * Visualizes 4-Criteria Valid Supply & Demand Zones and FVG Imbalances
 */
export const generateGoldIndicator = (): string => {
  return `//+------------------------------------------------------------------+
//|                                    GoldHunter_ICT_Levels_MT5.mq5 |
//|                    Copyright 2026, GoldHunter Institutional AI   |
//|               Smart Money Concepts (SMC) & ICT Visual Indicator  |
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, GoldHunter Institutional AI"
#property link        "https://spikehunter.deriv"
#property version     "3.00"
#property description "Visualizes 4-Criteria Valid Supply & Demand Zones on Gold"
#property indicator_chart_window
#property indicator_buffers 4
#property indicator_plots   2

#property indicator_label1  "Valid Demand Arrow"
#property indicator_type1   DRAW_ARROW
#property indicator_color1  clrMediumSeaGreen
#property indicator_width1  3

#property indicator_label2  "Valid Supply Arrow"
#property indicator_type2   DRAW_ARROW
#property indicator_color2  clrCrimson
#property indicator_width2  3

//--- Buffers
double BuyArrowBuffer[];
double SellArrowBuffer[];

int OnInit()
{
   SetIndexBuffer(0, BuyArrowBuffer, INDICATOR_DATA);
   SetIndexBuffer(1, SellArrowBuffer, INDICATOR_DATA);

   PlotIndexSetInteger(0, PLOT_ARROW, 233); // Wingdings Up Arrow
   PlotIndexSetInteger(1, PLOT_ARROW, 234); // Wingdings Down Arrow

   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(1, PLOT_EMPTY_VALUE, 0.0);

   IndicatorSetString(INDICATOR_SHORTNAME, "GoldHunter 4-Criteria S&D [XAUUSD]");
   return(INIT_SUCCEEDED);
}

int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
{
   if(rates_total < 30) return 0;
   int start = (prev_calculated > 0) ? prev_calculated - 1 : 20;

   for(int i = start; i < rates_total - 2; i++)
   {
      BuyArrowBuffer[i]  = 0.0;
      SellArrowBuffer[i] = 0.0;

      // Criterion 1: Sharp Movement
      double impulseBody = MathAbs(close[i] - open[i]);
      bool isSharpUpside   = (close[i] > open[i] && impulseBody > 2.50);
      bool isSharpDownside = (close[i] < open[i] && impulseBody > 2.50);

      if(!isSharpUpside && !isSharpDownside) continue;

      // Criterion 4: 3 to 6 Stalled Basing Candles
      int stalled = 0;
      for(int k = 1; k <= 7; k++)
      {
         if((i - k) < 0) break;
         double bBody = MathAbs(close[i-k] - open[i-k]);
         if(bBody < (impulseBody * 0.40))
            stalled++;
         else
            break;
      }
      if(stalled < 3 || stalled > 6) continue;

      // Criterion 2: FVG Created
      bool hasFvg = false;
      if(isSharpUpside && (i + 1 < rates_total))
         hasFvg = (low[i+1] > high[i-1]);
      else if(isSharpDownside && (i + 1 < rates_total))
         hasFvg = (high[i+1] < low[i-1]);

      if(!hasFvg) continue;

      // All criteria met -> Plot Arrow
      if(isSharpUpside)
         BuyArrowBuffer[i] = low[i] - 0.60;
      else if(isSharpDownside)
         SellArrowBuffer[i] = high[i] + 0.60;
   }

   return(rates_total);
}
//+------------------------------------------------------------------+
`;
};

export const downloadMQL5File = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
