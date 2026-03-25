import type {
  Country,
  Currency,
  CurrencyConversion,
  EnergyMarket,
  CountryRegulation,
  CustomsRegion,
  CrossBorderTrade,
  TradeOrder,
  PaymentTransaction,
  GlobalAnalyticsData,
  ArbitrageOpportunity,
  SupportedLanguage,
  Translations,
  LanguageOption,
  CurrencyPair,
} from '@/types/cross-border';

// ============================================================================
// Static Data
// ============================================================================

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', direction: 'ltr' },
];

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America', regulatoryBody: 'FERC', energyGridType: 'Interconnected', timezone: 'UTC-5', currency: 'USD' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', regulatoryBody: 'BNetzA', energyGridType: 'ENTSO-E', timezone: 'UTC+1', currency: 'EUR' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', regulatoryBody: 'Ofgem', energyGridType: 'National Grid', timezone: 'UTC+0', currency: 'GBP' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia Pacific', regulatoryBody: 'METI', energyGridType: 'Regional', timezone: 'UTC+9', currency: 'JPY' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia Pacific', regulatoryBody: 'NEA', energyGridType: 'State Grid', timezone: 'UTC+8', currency: 'CNY' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia Pacific', regulatoryBody: 'AER', energyGridType: 'NEM', timezone: 'UTC+10', currency: 'AUD' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America', regulatoryBody: 'CER', energyGridType: 'Interconnected', timezone: 'UTC-5', currency: 'CAD' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', regulatoryBody: 'CRE', energyGridType: 'ENTSO-E', timezone: 'UTC+1', currency: 'EUR' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America', regulatoryBody: 'ANEEL', energyGridType: 'SIN', timezone: 'UTC-3', currency: 'BRL' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia Pacific', regulatoryBody: 'CERC', energyGridType: 'National Grid', timezone: 'UTC+5:30', currency: 'INR' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia Pacific', regulatoryBody: 'MOTIE', energyGridType: 'KEPCO', timezone: 'UTC+9', currency: 'KRW' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', regulatoryBody: 'ECRA', energyGridType: 'SEC', timezone: 'UTC+3', currency: 'SAR' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'Middle East', regulatoryBody: 'EWEC', energyGridType: 'GCCIA', timezone: 'UTC+4', currency: 'AED' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa', regulatoryBody: 'NERC', energyGridType: 'TCN', timezone: 'UTC+1', currency: 'NGN' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa', regulatoryBody: 'NERSA', energyGridType: 'Eskom', timezone: 'UTC+2', currency: 'ZAR' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America', regulatoryBody: 'CRE', energyGridType: 'SEN', timezone: 'UTC-6', currency: 'MXN' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Europe', regulatoryBody: 'NVE', energyGridType: 'Nord Pool', timezone: 'UTC+1', currency: 'NOK' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia Pacific', regulatoryBody: 'EMA', energyGridType: 'NEMS', timezone: 'UTC+8', currency: 'SGD' },
];

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', exchangeRateToUSD: 1.0, country: 'US' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', exchangeRateToUSD: 1.08, country: 'EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', exchangeRateToUSD: 1.26, country: 'GB' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', exchangeRateToUSD: 0.0067, country: 'JP' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', exchangeRateToUSD: 0.14, country: 'CN' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', exchangeRateToUSD: 0.65, country: 'AU' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', exchangeRateToUSD: 0.74, country: 'CA' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', exchangeRateToUSD: 1.12, country: 'CH' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', exchangeRateToUSD: 0.012, country: 'IN' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', exchangeRateToUSD: 0.00076, country: 'KR' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', exchangeRateToUSD: 0.20, country: 'BR' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽', exchangeRateToUSD: 0.058, country: 'MX' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', flag: '🇸🇦', exchangeRateToUSD: 0.27, country: 'SA' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', exchangeRateToUSD: 0.27, country: 'AE' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', exchangeRateToUSD: 0.00065, country: 'NG' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', exchangeRateToUSD: 0.053, country: 'ZA' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', exchangeRateToUSD: 0.094, country: 'NO' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', exchangeRateToUSD: 0.74, country: 'SG' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', exchangeRateToUSD: 0.096, country: 'SE' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', exchangeRateToUSD: 0.145, country: 'DK' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', exchangeRateToUSD: 0.61, country: 'NZ' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', exchangeRateToUSD: 0.028, country: 'TH' },
];

export const FAVORITE_PAIRS: CurrencyPair[] = [
  { from: 'USD', to: 'EUR', label: 'USD/EUR' },
  { from: 'USD', to: 'GBP', label: 'USD/GBP' },
  { from: 'EUR', to: 'JPY', label: 'EUR/JPY' },
  { from: 'GBP', to: 'USD', label: 'GBP/USD' },
  { from: 'USD', to: 'CNY', label: 'USD/CNY' },
  { from: 'AUD', to: 'USD', label: 'AUD/USD' },
];

// ============================================================================
// Translation Dictionaries
// ============================================================================

const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    'nav.markets': 'Markets', 'nav.currency': 'Currency', 'nav.compliance': 'Compliance',
    'nav.customs': 'Customs', 'nav.analytics': 'Analytics',
    'header.title': 'Cross-Border Energy Trading',
    'header.subtitle': 'Trade energy across international markets with full regulatory compliance',
    'markets.title': 'International Markets', 'markets.searchPlaceholder': 'Search markets...',
    'markets.country': 'Country', 'markets.price': 'Price/kWh', 'markets.volume': '24h Volume',
    'markets.change': '24h Change', 'markets.status': 'Status', 'markets.trade': 'Trade',
    'trade.buy': 'Buy', 'trade.sell': 'Sell', 'trade.amount': 'Amount (kWh)',
    'trade.execute': 'Execute Trade', 'trade.processing': 'Processing...',
    'trade.success': 'Trade Executed Successfully!', 'trade.totalValue': 'Total Value',
    'currency.title': 'Currency Converter', 'currency.from': 'From', 'currency.to': 'To',
    'currency.convert': 'Convert', 'currency.rate': 'Exchange Rate', 'currency.favorites': 'Quick Pairs',
    'compliance.title': 'Regulatory Compliance', 'compliance.selectCountry': 'Select Country',
    'compliance.status': 'Compliance Status', 'compliance.requirements': 'Requirements',
    'compliance.compliant': 'Compliant', 'compliance.pending': 'Pending', 'compliance.nonCompliant': 'Non-Compliant',
    'customs.title': 'Customs Integration', 'customs.selectRegion': 'Select Region',
    'customs.clearanceTime': 'Avg Clearance Time', 'customs.documents': 'Required Documents',
    'customs.tariffCode': 'Tariff Code', 'customs.dutyRate': 'Duty Rate',
    'analytics.title': 'Global Analytics', 'analytics.totalVolume': 'Total Volume',
    'analytics.activeMarkets': 'Active Markets', 'analytics.avgPrice': 'Avg Price',
    'analytics.topSpread': 'Top Spread', 'analytics.arbitrage': 'Arbitrage Opportunities',
    'analytics.trends': 'Market Trends',
    'common.loading': 'Loading...', 'common.error': 'An error occurred', 'common.noData': 'No data available',
  },
  es: {
    'nav.markets': 'Mercados', 'nav.currency': 'Moneda', 'nav.compliance': 'Cumplimiento',
    'nav.customs': 'Aduanas', 'nav.analytics': 'Analíticas',
    'header.title': 'Comercio Transfronterizo de Energía',
    'header.subtitle': 'Comercie energía en mercados internacionales con cumplimiento regulatorio',
    'markets.title': 'Mercados Internacionales', 'markets.searchPlaceholder': 'Buscar mercados...',
    'markets.country': 'País', 'markets.price': 'Precio/kWh', 'markets.volume': 'Volumen 24h',
    'markets.change': 'Cambio 24h', 'markets.status': 'Estado', 'markets.trade': 'Comerciar',
    'trade.buy': 'Comprar', 'trade.sell': 'Vender', 'trade.amount': 'Cantidad (kWh)',
    'trade.execute': 'Ejecutar Comercio', 'trade.processing': 'Procesando...',
    'trade.success': '¡Comercio ejecutado con éxito!', 'trade.totalValue': 'Valor Total',
    'currency.title': 'Convertidor de Moneda', 'currency.from': 'De', 'currency.to': 'A',
    'currency.convert': 'Convertir', 'currency.rate': 'Tipo de Cambio', 'currency.favorites': 'Pares Rápidos',
    'compliance.title': 'Cumplimiento Regulatorio', 'compliance.selectCountry': 'Seleccionar País',
    'compliance.status': 'Estado de Cumplimiento', 'compliance.requirements': 'Requisitos',
    'compliance.compliant': 'Cumple', 'compliance.pending': 'Pendiente', 'compliance.nonCompliant': 'No Cumple',
    'customs.title': 'Integración Aduanera', 'customs.selectRegion': 'Seleccionar Región',
    'customs.clearanceTime': 'Tiempo Promedio de Despacho', 'customs.documents': 'Documentos Requeridos',
    'customs.tariffCode': 'Código Arancelario', 'customs.dutyRate': 'Tasa de Derecho',
    'analytics.title': 'Analíticas Globales', 'analytics.totalVolume': 'Volumen Total',
    'analytics.activeMarkets': 'Mercados Activos', 'analytics.avgPrice': 'Precio Promedio',
    'analytics.topSpread': 'Mayor Diferencial', 'analytics.arbitrage': 'Oportunidades de Arbitraje',
    'analytics.trends': 'Tendencias del Mercado',
    'common.loading': 'Cargando...', 'common.error': 'Ocurrió un error', 'common.noData': 'Sin datos disponibles',
  },
  fr: {
    'nav.markets': 'Marchés', 'nav.currency': 'Devise', 'nav.compliance': 'Conformité',
    'nav.customs': 'Douanes', 'nav.analytics': 'Analytiques',
    'header.title': 'Commerce Transfrontalier d\'Énergie',
    'header.subtitle': 'Échangez de l\'énergie sur les marchés internationaux en conformité réglementaire',
    'markets.title': 'Marchés Internationaux', 'markets.searchPlaceholder': 'Rechercher des marchés...',
    'markets.country': 'Pays', 'markets.price': 'Prix/kWh', 'markets.volume': 'Volume 24h',
    'markets.change': 'Variation 24h', 'markets.status': 'Statut', 'markets.trade': 'Échanger',
    'trade.buy': 'Acheter', 'trade.sell': 'Vendre', 'trade.amount': 'Montant (kWh)',
    'trade.execute': 'Exécuter l\'Échange', 'trade.processing': 'Traitement...',
    'trade.success': 'Échange exécuté avec succès!', 'trade.totalValue': 'Valeur Totale',
    'currency.title': 'Convertisseur de Devises', 'currency.from': 'De', 'currency.to': 'À',
    'currency.convert': 'Convertir', 'currency.rate': 'Taux de Change', 'currency.favorites': 'Paires Rapides',
    'compliance.title': 'Conformité Réglementaire', 'compliance.selectCountry': 'Sélectionner le Pays',
    'compliance.status': 'Statut de Conformité', 'compliance.requirements': 'Exigences',
    'compliance.compliant': 'Conforme', 'compliance.pending': 'En Attente', 'compliance.nonCompliant': 'Non Conforme',
    'customs.title': 'Intégration Douanière', 'customs.selectRegion': 'Sélectionner la Région',
    'customs.clearanceTime': 'Temps de Dédouanement Moyen', 'customs.documents': 'Documents Requis',
    'customs.tariffCode': 'Code Tarifaire', 'customs.dutyRate': 'Taux de Droit',
    'analytics.title': 'Analytiques Globales', 'analytics.totalVolume': 'Volume Total',
    'analytics.activeMarkets': 'Marchés Actifs', 'analytics.avgPrice': 'Prix Moyen',
    'analytics.topSpread': 'Meilleur Écart', 'analytics.arbitrage': 'Opportunités d\'Arbitrage',
    'analytics.trends': 'Tendances du Marché',
    'common.loading': 'Chargement...', 'common.error': 'Une erreur est survenue', 'common.noData': 'Aucune donnée disponible',
  },
  de: {
    'nav.markets': 'Märkte', 'nav.currency': 'Währung', 'nav.compliance': 'Konformität',
    'nav.customs': 'Zoll', 'nav.analytics': 'Analytik',
    'header.title': 'Grenzüberschreitender Energiehandel',
    'header.subtitle': 'Handeln Sie Energie auf internationalen Märkten mit regulatorischer Konformität',
    'markets.title': 'Internationale Märkte', 'markets.searchPlaceholder': 'Märkte suchen...',
    'markets.country': 'Land', 'markets.price': 'Preis/kWh', 'markets.volume': '24h Volumen',
    'markets.change': '24h Änderung', 'markets.status': 'Status', 'markets.trade': 'Handeln',
    'trade.buy': 'Kaufen', 'trade.sell': 'Verkaufen', 'trade.amount': 'Menge (kWh)',
    'trade.execute': 'Handel Ausführen', 'trade.processing': 'Verarbeitung...',
    'trade.success': 'Handel erfolgreich ausgeführt!', 'trade.totalValue': 'Gesamtwert',
    'currency.title': 'Währungsrechner', 'currency.from': 'Von', 'currency.to': 'Nach',
    'currency.convert': 'Umrechnen', 'currency.rate': 'Wechselkurs', 'currency.favorites': 'Schnellpaare',
    'compliance.title': 'Regulatorische Konformität', 'compliance.selectCountry': 'Land Auswählen',
    'compliance.status': 'Konformitätsstatus', 'compliance.requirements': 'Anforderungen',
    'compliance.compliant': 'Konform', 'compliance.pending': 'Ausstehend', 'compliance.nonCompliant': 'Nicht Konform',
    'customs.title': 'Zollintegration', 'customs.selectRegion': 'Region Auswählen',
    'customs.clearanceTime': 'Durchschnittliche Abfertigungszeit', 'customs.documents': 'Erforderliche Dokumente',
    'customs.tariffCode': 'Zolltarifnummer', 'customs.dutyRate': 'Zollsatz',
    'analytics.title': 'Globale Analytik', 'analytics.totalVolume': 'Gesamtvolumen',
    'analytics.activeMarkets': 'Aktive Märkte', 'analytics.avgPrice': 'Durchschnittspreis',
    'analytics.topSpread': 'Beste Spanne', 'analytics.arbitrage': 'Arbitrage-Möglichkeiten',
    'analytics.trends': 'Markttrends',
    'common.loading': 'Laden...', 'common.error': 'Ein Fehler ist aufgetreten', 'common.noData': 'Keine Daten verfügbar',
  },
  zh: {
    'nav.markets': '市场', 'nav.currency': '货币', 'nav.compliance': '合规',
    'nav.customs': '海关', 'nav.analytics': '分析',
    'header.title': '跨境能源交易',
    'header.subtitle': '在国际市场上合规交易能源',
    'markets.title': '国际市场', 'markets.searchPlaceholder': '搜索市场...',
    'markets.country': '国家', 'markets.price': '价格/kWh', 'markets.volume': '24小时交易量',
    'markets.change': '24小时变化', 'markets.status': '状态', 'markets.trade': '交易',
    'trade.buy': '买入', 'trade.sell': '卖出', 'trade.amount': '数量 (kWh)',
    'trade.execute': '执行交易', 'trade.processing': '处理中...',
    'trade.success': '交易执行成功！', 'trade.totalValue': '总价值',
    'currency.title': '货币转换器', 'currency.from': '从', 'currency.to': '到',
    'currency.convert': '转换', 'currency.rate': '汇率', 'currency.favorites': '快速配对',
    'compliance.title': '监管合规', 'compliance.selectCountry': '选择国家',
    'compliance.status': '合规状态', 'compliance.requirements': '要求',
    'compliance.compliant': '合规', 'compliance.pending': '待定', 'compliance.nonCompliant': '不合规',
    'customs.title': '海关整合', 'customs.selectRegion': '选择地区',
    'customs.clearanceTime': '平均通关时间', 'customs.documents': '所需文件',
    'customs.tariffCode': '关税代码', 'customs.dutyRate': '关税税率',
    'analytics.title': '全球分析', 'analytics.totalVolume': '总交易量',
    'analytics.activeMarkets': '活跃市场', 'analytics.avgPrice': '平均价格',
    'analytics.topSpread': '最大价差', 'analytics.arbitrage': '套利机会',
    'analytics.trends': '市场趋势',
    'common.loading': '加载中...', 'common.error': '发生错误', 'common.noData': '无可用数据',
  },
  ja: {
    'nav.markets': 'マーケット', 'nav.currency': '通貨', 'nav.compliance': 'コンプライアンス',
    'nav.customs': '税関', 'nav.analytics': '分析',
    'header.title': '国際エネルギー取引',
    'header.subtitle': '規制に準拠した国際市場でエネルギーを取引',
    'markets.title': '国際マーケット', 'markets.searchPlaceholder': 'マーケットを検索...',
    'markets.country': '国', 'markets.price': '価格/kWh', 'markets.volume': '24時間取引量',
    'markets.change': '24時間変動', 'markets.status': 'ステータス', 'markets.trade': '取引',
    'trade.buy': '購入', 'trade.sell': '売却', 'trade.amount': '数量 (kWh)',
    'trade.execute': '取引実行', 'trade.processing': '処理中...',
    'trade.success': '取引が正常に実行されました！', 'trade.totalValue': '合計金額',
    'currency.title': '通貨コンバーター', 'currency.from': 'から', 'currency.to': 'へ',
    'currency.convert': '変換', 'currency.rate': '為替レート', 'currency.favorites': 'クイックペア',
    'compliance.title': '規制コンプライアンス', 'compliance.selectCountry': '国を選択',
    'compliance.status': 'コンプライアンスステータス', 'compliance.requirements': '要件',
    'compliance.compliant': '準拠', 'compliance.pending': '保留中', 'compliance.nonCompliant': '非準拠',
    'customs.title': '税関統合', 'customs.selectRegion': '地域を選択',
    'customs.clearanceTime': '平均通関時間', 'customs.documents': '必要書類',
    'customs.tariffCode': '関税コード', 'customs.dutyRate': '関税率',
    'analytics.title': 'グローバル分析', 'analytics.totalVolume': '総取引量',
    'analytics.activeMarkets': 'アクティブマーケット', 'analytics.avgPrice': '平均価格',
    'analytics.topSpread': '最大スプレッド', 'analytics.arbitrage': '裁定取引の機会',
    'analytics.trends': '市場トレンド',
    'common.loading': '読み込み中...', 'common.error': 'エラーが発生しました', 'common.noData': 'データがありません',
  },
  ar: {
    'nav.markets': 'الأسواق', 'nav.currency': 'العملة', 'nav.compliance': 'الامتثال',
    'nav.customs': 'الجمارك', 'nav.analytics': 'التحليلات',
    'header.title': 'تداول الطاقة عبر الحدود',
    'header.subtitle': 'تداول الطاقة في الأسواق الدولية مع الامتثال التنظيمي الكامل',
    'markets.title': 'الأسواق الدولية', 'markets.searchPlaceholder': 'البحث في الأسواق...',
    'markets.country': 'الدولة', 'markets.price': 'السعر/كيلوواط', 'markets.volume': 'الحجم 24 ساعة',
    'markets.change': 'التغيير 24 ساعة', 'markets.status': 'الحالة', 'markets.trade': 'تداول',
    'trade.buy': 'شراء', 'trade.sell': 'بيع', 'trade.amount': 'الكمية (كيلوواط)',
    'trade.execute': 'تنفيذ التداول', 'trade.processing': 'جاري المعالجة...',
    'trade.success': 'تم تنفيذ التداول بنجاح!', 'trade.totalValue': 'القيمة الإجمالية',
    'currency.title': 'محول العملات', 'currency.from': 'من', 'currency.to': 'إلى',
    'currency.convert': 'تحويل', 'currency.rate': 'سعر الصرف', 'currency.favorites': 'أزواج سريعة',
    'compliance.title': 'الامتثال التنظيمي', 'compliance.selectCountry': 'اختر الدولة',
    'compliance.status': 'حالة الامتثال', 'compliance.requirements': 'المتطلبات',
    'compliance.compliant': 'ممتثل', 'compliance.pending': 'قيد الانتظار', 'compliance.nonCompliant': 'غير ممتثل',
    'customs.title': 'تكامل الجمارك', 'customs.selectRegion': 'اختر المنطقة',
    'customs.clearanceTime': 'متوسط وقت التخليص', 'customs.documents': 'المستندات المطلوبة',
    'customs.tariffCode': 'رمز التعرفة', 'customs.dutyRate': 'معدل الرسوم',
    'analytics.title': 'التحليلات العالمية', 'analytics.totalVolume': 'الحجم الإجمالي',
    'analytics.activeMarkets': 'الأسواق النشطة', 'analytics.avgPrice': 'متوسط السعر',
    'analytics.topSpread': 'أعلى فارق', 'analytics.arbitrage': 'فرص المراجحة',
    'analytics.trends': 'اتجاهات السوق',
    'common.loading': 'جاري التحميل...', 'common.error': 'حدث خطأ', 'common.noData': 'لا تتوفر بيانات',
  },
  pt: {
    'nav.markets': 'Mercados', 'nav.currency': 'Moeda', 'nav.compliance': 'Conformidade',
    'nav.customs': 'Alfândega', 'nav.analytics': 'Análises',
    'header.title': 'Comércio Transfronteiriço de Energia',
    'header.subtitle': 'Negocie energia em mercados internacionais com conformidade regulatória',
    'markets.title': 'Mercados Internacionais', 'markets.searchPlaceholder': 'Buscar mercados...',
    'markets.country': 'País', 'markets.price': 'Preço/kWh', 'markets.volume': 'Volume 24h',
    'markets.change': 'Variação 24h', 'markets.status': 'Status', 'markets.trade': 'Negociar',
    'trade.buy': 'Comprar', 'trade.sell': 'Vender', 'trade.amount': 'Quantidade (kWh)',
    'trade.execute': 'Executar Negociação', 'trade.processing': 'Processando...',
    'trade.success': 'Negociação executada com sucesso!', 'trade.totalValue': 'Valor Total',
    'currency.title': 'Conversor de Moedas', 'currency.from': 'De', 'currency.to': 'Para',
    'currency.convert': 'Converter', 'currency.rate': 'Taxa de Câmbio', 'currency.favorites': 'Pares Rápidos',
    'compliance.title': 'Conformidade Regulatória', 'compliance.selectCountry': 'Selecionar País',
    'compliance.status': 'Status de Conformidade', 'compliance.requirements': 'Requisitos',
    'compliance.compliant': 'Conforme', 'compliance.pending': 'Pendente', 'compliance.nonCompliant': 'Não Conforme',
    'customs.title': 'Integração Alfandegária', 'customs.selectRegion': 'Selecionar Região',
    'customs.clearanceTime': 'Tempo Médio de Liberação', 'customs.documents': 'Documentos Necessários',
    'customs.tariffCode': 'Código Tarifário', 'customs.dutyRate': 'Taxa de Direito',
    'analytics.title': 'Análises Globais', 'analytics.totalVolume': 'Volume Total',
    'analytics.activeMarkets': 'Mercados Ativos', 'analytics.avgPrice': 'Preço Médio',
    'analytics.topSpread': 'Maior Spread', 'analytics.arbitrage': 'Oportunidades de Arbitragem',
    'analytics.trends': 'Tendências do Mercado',
    'common.loading': 'Carregando...', 'common.error': 'Ocorreu um erro', 'common.noData': 'Sem dados disponíveis',
  },
};

// ============================================================================
// Helper: simulate network delay
// ============================================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// Service Functions
// ============================================================================

export async function getMarkets(): Promise<EnergyMarket[]> {
  await delay(400);
  return COUNTRIES.map((country, i) => ({
    id: `MKT-${country.code}`,
    country,
    pricePerKwh: parseFloat((0.04 + Math.random() * 0.14).toFixed(4)),
    currency: country.currency,
    volume24h: Math.floor(50000 + Math.random() * 950000),
    change24h: parseFloat((-8 + Math.random() * 16).toFixed(2)),
    status: i % 7 === 0 ? 'restricted' as const : i % 5 === 0 ? 'pre-market' as const : 'open' as const,
    peakHours: '14:00 - 20:00',
    renewablePercentage: Math.floor(15 + Math.random() * 70),
    lastUpdated: new Date().toISOString(),
  }));
}

export async function getCurrencies(): Promise<Currency[]> {
  await delay(200);
  return CURRENCIES;
}

export async function convertCurrency(
  fromCode: string,
  toCode: string,
  amount: number
): Promise<CurrencyConversion> {
  await delay(300);
  const from = CURRENCIES.find(c => c.code === fromCode)!;
  const to = CURRENCIES.find(c => c.code === toCode)!;
  const rate = from.exchangeRateToUSD / to.exchangeRateToUSD;
  return {
    from,
    to,
    rate,
    amount,
    convertedAmount: parseFloat((amount * rate).toFixed(4)),
    timestamp: new Date().toISOString(),
  };
}

export async function getRegulations(countryCode?: string): Promise<CountryRegulation[]> {
  await delay(500);
  const makeReqs = (code: string) => {
    const statuses: Array<'compliant' | 'pending' | 'non-compliant'> = ['compliant', 'pending', 'compliant', 'compliant', 'non-compliant'];
    return [
      { id: `${code}-carbon`, name: 'Carbon Tax Compliance', description: 'Meeting carbon emission taxation requirements', status: statuses[Math.floor(Math.random() * 3)], mandatory: true },
      { id: `${code}-license`, name: 'Energy Trading License', description: 'Valid license to trade energy in the jurisdiction', status: statuses[Math.floor(Math.random() * 2)], mandatory: true },
      { id: `${code}-grid`, name: 'Grid Connection Permit', description: 'Authorization for grid interconnection', status: statuses[Math.floor(Math.random() * 3)], mandatory: true },
      { id: `${code}-import`, name: 'Import Authorization', description: 'Permission for energy import from foreign sources', status: statuses[Math.floor(Math.random() * 4)], mandatory: true },
      { id: `${code}-export`, name: 'Export Authorization', description: 'Permission for energy export to foreign markets', status: statuses[Math.floor(Math.random() * 4)], mandatory: false },
      { id: `${code}-env`, name: 'Environmental Assessment', description: 'Environmental impact assessment approval', status: statuses[Math.floor(Math.random() * 3)], mandatory: true },
      { id: `${code}-report`, name: 'Quarterly Reporting', description: 'Regular reporting to the regulatory body', status: 'compliant' as const, mandatory: true },
    ];
  };

  const risks: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'low', 'high', 'medium'];

  const all = COUNTRIES.map(c => {
    const reqs = makeReqs(c.code);
    const nonCompliant = reqs.filter(r => r.status === 'non-compliant').length;
    const pending = reqs.filter(r => r.status === 'pending').length;
    const overall = nonCompliant > 0 ? 'non-compliant' as const : pending > 0 ? 'pending' as const : 'compliant' as const;
    return {
      countryCode: c.code,
      countryName: c.name,
      flag: c.flag,
      regulatoryBody: c.regulatoryBody,
      overallStatus: overall,
      riskLevel: risks[Math.floor(Math.random() * risks.length)],
      carbonTaxRate: parseFloat((5 + Math.random() * 45).toFixed(1)),
      requirements: reqs,
      importRules: ['Energy origin certification required', 'Maximum import volume limits apply', 'Cross-border transmission charges'],
      exportRules: ['Export license required', 'Surplus verification needed', 'Green certificate may be required'],
      lastAudit: '2025-12-15',
    } satisfies CountryRegulation;
  });

  return countryCode ? all.filter(r => r.countryCode === countryCode) : all;
}

export async function getCustomsRegions(): Promise<CustomsRegion[]> {
  await delay(400);
  const regions = [
    { id: 'eu', name: 'European Union', code: 'EU', clearanceTimeAvg: '2-4 hours', notes: 'Simplified procedures for intra-EU energy transfers' },
    { id: 'nafta', name: 'North America (USMCA)', code: 'USMCA', clearanceTimeAvg: '4-8 hours', notes: 'USMCA preferential rates for qualifying energy' },
    { id: 'apac', name: 'Asia-Pacific', code: 'APAC', clearanceTimeAvg: '6-12 hours', notes: 'Varies significantly per country. Check bilateral agreements.' },
    { id: 'gcc', name: 'Gulf Cooperation Council', code: 'GCC', clearanceTimeAvg: '3-6 hours', notes: 'Unified customs system for GCC member states' },
    { id: 'au-nz', name: 'Australia-New Zealand', code: 'CER', clearanceTimeAvg: '4-6 hours', notes: 'Closer Economic Relations trade agreement applies' },
    { id: 'mercosur', name: 'Mercosur', code: 'MERCOSUR', clearanceTimeAvg: '8-16 hours', notes: 'Free trade zone with common external tariff' },
    { id: 'asean', name: 'ASEAN', code: 'ASEAN', clearanceTimeAvg: '6-10 hours', notes: 'ASEAN Free Trade Area preferential rates available' },
    { id: 'eac', name: 'East African Community', code: 'EAC', clearanceTimeAvg: '12-24 hours', notes: 'Single customs territory with common tariff' },
    { id: 'sacu', name: 'Southern African Customs Union', code: 'SACU', clearanceTimeAvg: '8-16 hours', notes: 'Common external tariff and revenue sharing' },
    { id: 'uk', name: 'United Kingdom', code: 'UK', clearanceTimeAvg: '4-8 hours', notes: 'Post-Brexit customs procedures apply' },
    { id: 'india', name: 'India', code: 'IN', clearanceTimeAvg: '8-12 hours', notes: 'Central Board of Indirect Taxes procedures' },
    { id: 'china', name: 'China', code: 'CN', clearanceTimeAvg: '6-10 hours', notes: 'State Grid import/export authorities involved' },
  ];

  return regions.map(r => ({
    ...r,
    tariffCodes: [
      { code: '2716.00', description: 'Electrical energy', dutyRate: parseFloat((0 + Math.random() * 8).toFixed(1)), unit: 'kWh' },
      { code: '2716.00.10', description: 'Renewable electrical energy', dutyRate: parseFloat((0 + Math.random() * 4).toFixed(1)), unit: 'kWh' },
      { code: '2716.00.20', description: 'Conventional electrical energy', dutyRate: parseFloat((2 + Math.random() * 10).toFixed(1)), unit: 'kWh' },
    ],
    requiredDocuments: [
      { id: `${r.id}-inv`, name: 'Commercial Invoice', required: true, status: 'approved' as const, description: 'Detailed invoice with quantity, price, and origin' },
      { id: `${r.id}-cert`, name: 'Certificate of Origin', required: true, status: 'submitted' as const, description: 'Proof of energy production origin' },
      { id: `${r.id}-phyto`, name: 'Regulatory Compliance Certificate', required: true, status: 'pending' as const, description: 'Certificate from energy regulatory body' },
      { id: `${r.id}-bill`, name: 'Bill of Lading / Transmission Record', required: true, status: 'approved' as const, description: 'Record of energy transmission' },
      { id: `${r.id}-ins`, name: 'Insurance Certificate', required: false, status: 'pending' as const, description: 'Coverage for transmission losses' },
    ],
    clearanceSteps: [
      { id: 1, name: 'Document Submission', description: 'Submit all required customs documentation', status: 'completed' as const, estimatedTime: '30 min' },
      { id: 2, name: 'Document Review', description: 'Customs authority reviews submitted documents', status: 'completed' as const, estimatedTime: '1-2 hours' },
      { id: 3, name: 'Tariff Assessment', description: 'Duty rates and tariff codes verification', status: 'in-progress' as const, estimatedTime: '1 hour' },
      { id: 4, name: 'Compliance Check', description: 'Verify regulatory compliance and certifications', status: 'pending' as const, estimatedTime: '1-2 hours' },
      { id: 5, name: 'Clearance Approval', description: 'Final approval and release for transmission', status: 'pending' as const, estimatedTime: '30 min' },
    ],
  }));
}

export async function getGlobalAnalytics(): Promise<GlobalAnalyticsData> {
  await delay(600);

  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const trends = months.map(m => ({
    date: m,
    totalVolume: Math.floor(800000 + Math.random() * 600000),
    avgPrice: parseFloat((0.06 + Math.random() * 0.06).toFixed(3)),
    activeMarkets: Math.floor(14 + Math.random() * 5),
    crossBorderTrades: Math.floor(3000 + Math.random() * 4000),
  }));

  const regionalBreakdown = [
    { region: 'Europe', volume: 420000, percentage: 32, color: '#3B82F6' },
    { region: 'North America', volume: 350000, percentage: 27, color: '#10B981' },
    { region: 'Asia Pacific', volume: 280000, percentage: 21, color: '#F59E0B' },
    { region: 'Middle East', volume: 120000, percentage: 9, color: '#8B5CF6' },
    { region: 'South America', volume: 85000, percentage: 7, color: '#EC4899' },
    { region: 'Africa', volume: 55000, percentage: 4, color: '#F97316' },
  ];

  const marketComparisons: import('@/types/cross-border').MarketComparison[] = COUNTRIES.slice(0, 12).map(c => ({
    country: c.name,
    flag: c.flag,
    price: parseFloat((0.04 + Math.random() * 0.14).toFixed(3)),
    volume: Math.floor(20000 + Math.random() * 200000),
    renewable: Math.floor(15 + Math.random() * 70),
  }));

  const arbitrageOpportunities: ArbitrageOpportunity[] = [
    { id: 'ARB-001', buyMarket: 'Norway', buyPrice: 0.042, sellMarket: 'Germany', sellPrice: 0.128, spread: 0.086, spreadPercent: 204.8, volume: 150000, currency: 'USD', risk: 'low' },
    { id: 'ARB-002', buyMarket: 'Canada', buyPrice: 0.055, sellMarket: 'Japan', sellPrice: 0.152, spread: 0.097, spreadPercent: 176.4, volume: 80000, currency: 'USD', risk: 'medium' },
    { id: 'ARB-003', buyMarket: 'Brazil', buyPrice: 0.048, sellMarket: 'UK', sellPrice: 0.135, spread: 0.087, spreadPercent: 181.3, volume: 95000, currency: 'USD', risk: 'medium' },
    { id: 'ARB-004', buyMarket: 'Australia', buyPrice: 0.061, sellMarket: 'Singapore', sellPrice: 0.142, spread: 0.081, spreadPercent: 132.8, volume: 60000, currency: 'USD', risk: 'low' },
    { id: 'ARB-005', buyMarket: 'Nigeria', buyPrice: 0.038, sellMarket: 'UAE', sellPrice: 0.098, spread: 0.060, spreadPercent: 157.9, volume: 45000, currency: 'USD', risk: 'high' },
    { id: 'ARB-006', buyMarket: 'Mexico', buyPrice: 0.052, sellMarket: 'South Korea', sellPrice: 0.118, spread: 0.066, spreadPercent: 126.9, volume: 70000, currency: 'USD', risk: 'medium' },
  ];

  return {
    trends,
    regionalBreakdown,
    marketComparisons,
    arbitrageOpportunities,
    summary: {
      totalVolume: 1310000,
      activeMarkets: 18,
      avgPrice: 0.089,
      topArbitrageSpread: 204.8,
    },
  };
}

export async function executeTrade(order: TradeOrder): Promise<CrossBorderTrade> {
  await delay(2000); // simulate processing
  const market = (await getMarkets()).find(m => m.country.code === order.destCountry);
  const price = market?.pricePerKwh ?? 0.08;
  return {
    id: `TRD-${Date.now().toString(36).toUpperCase()}`,
    sourceCountry: order.sourceCountry,
    destCountry: order.destCountry,
    type: order.type,
    amountKwh: order.amountKwh,
    pricePerKwh: price,
    currency: order.currency,
    totalValue: parseFloat((order.amountKwh * price).toFixed(2)),
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    estimatedCompletion: new Date().toISOString(),
  };
}

export async function processPayment(tradeId: string, amount: number, currency: string): Promise<PaymentTransaction> {
  await delay(1500);
  return {
    id: `PAY-${Date.now().toString(36).toUpperCase()}`,
    tradeId,
    amount,
    currency,
    status: 'completed',
    method: 'Stellar Network',
    processedAt: new Date().toISOString(),
  };
}

export function getTranslations(lang: SupportedLanguage): Translations {
  return TRANSLATIONS[lang] ?? TRANSLATIONS.en;
}

export function getCountries(): Country[] {
  return COUNTRIES;
}
