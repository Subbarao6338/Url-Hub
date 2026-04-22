import React, { useState, useEffect, useMemo, memo } from 'react';
import CategoryNav from './CategoryNav';
import ErrorBoundary from './ErrorBoundary';
import NatureEmptyState from './NatureEmptyState';
import DOMPurify from 'dompurify';

const Calculator = React.lazy(() => import('./tools/Calculator'));
const QrGen = React.lazy(() => import('./tools/QrGen'));
const PasswordGenerator = React.lazy(() => import('./tools/PasswordGenerator'));
const UnitConverter = React.lazy(() => import('./tools/UnitConverter'));
const CurrencyConverter = React.lazy(() => import('./tools/CurrencyConverter'));
const Stopwatch = React.lazy(() => import('./tools/Stopwatch'));
const Notes = React.lazy(() => import('./tools/Notes'));
const Translate = React.lazy(() => import('./tools/Translate'));
const MorseCode = React.lazy(() => import('./tools/MorseCode'));
const AgeCalculator = React.lazy(() => import('./tools/AgeCalculator'));
const BMICalculator = React.lazy(() => import('./tools/BMICalculator'));
const ColorPicker = React.lazy(() => import('./tools/ColorPicker'));
const TimestampConverter = React.lazy(() => import('./tools/TimestampConverter'));
const LoremIpsum = React.lazy(() => import('./tools/LoremIpsum'));
const TextUtils = React.lazy(() => import('./tools/TextUtils'));
const WordCounter = React.lazy(() => import('./tools/WordCounter'));
const WordRankCalculator = React.lazy(() => import('./tools/WordRankCalculator'));
const JsonFormatter = React.lazy(() => import('./tools/JsonFormatter'));
const CsvJsonConverter = React.lazy(() => import('./tools/CsvJsonConverter'));
const ImageOptimizer = React.lazy(() => import('./tools/ImageOptimizer'));
const Base64Converter = React.lazy(() => import('./tools/Base64Converter'));
const DeviceInfo = React.lazy(() => import('./tools/DeviceInfo'));
const AndroidSensors = React.lazy(() => import('./tools/AndroidSensors'));
const PomodoroTimer = React.lazy(() => import('./tools/PomodoroTimer'));
const MarkdownPreview = React.lazy(() => import('./tools/MarkdownPreview'));
const TeluguPanchangam = React.lazy(() => import('./tools/TeluguPanchangam'));
const AiSummary = React.lazy(() => import('./tools/AiSummary'));
const OmniHub = React.lazy(() => import('./tools/OmniHub'));
const NetworkTools = React.lazy(() => import('./tools/NetworkTools'));
const Cookies = React.lazy(() => import('./tools/Cookies'));
const Inspect = React.lazy(() => import('./tools/Inspect'));
const UrlTool = React.lazy(() => import('./tools/UrlTool'));
const SecurityInfo = React.lazy(() => import('./tools/SecurityInfo'));
const UserScripts = React.lazy(() => import('./tools/UserScripts'));
const DiffViewer = React.lazy(() => import('./tools/DiffViewer'));
const AnomalyDetection = React.lazy(() => import('./tools/AnomalyDetection'));
const HashGenerator = React.lazy(() => import('./tools/HashGenerator'));
const GlassGenerator = React.lazy(() => import('./tools/GlassGenerator'));
const JsonToCsv = React.lazy(() => import('./tools/JsonToCsv'));
const JsonValidator = React.lazy(() => import('./tools/JsonValidator'));
const AspectRatioCalc = React.lazy(() => import('./tools/AspectRatioCalc'));
const HtmlEntities = React.lazy(() => import('./tools/HtmlEntities'));
const CronExpressionDescriptor = React.lazy(() => import('./tools/CronExpressionDescriptor'));
const DataQuality = React.lazy(() => import('./tools/DataQuality'));
const DataAnonymizer = React.lazy(() => import('./tools/DataAnonymizer'));
const Observability = React.lazy(() => import('./tools/Observability'));
const DataPortal = React.lazy(() => import('./tools/DataPortal'));
const AzureIntegration = React.lazy(() => import('./tools/AzureIntegration'));
const SpecializedTools = React.lazy(() => import('./tools/SpecializedTools'));
const UuidGenerator = React.lazy(() => import('./tools/UuidGenerator'));
const DiceRoller = React.lazy(() => import('./tools/DiceRoller'));
const CoinFlipper = React.lazy(() => import('./tools/CoinFlipper'));
const Counter = React.lazy(() => import('./tools/Counter'));
const MarkdownTable = React.lazy(() => import('./tools/MarkdownTable'));
const Measurements = React.lazy(() => import('./tools/Measurements'));
const Games = React.lazy(() => import('./tools/Games'));
const MathTools = React.lazy(() => import('./tools/MathTools'));
const Generators = React.lazy(() => import('./tools/Generators'));
const FinanceCalculators = React.lazy(() => import('./tools/FinanceCalculators'));
const MiscCalculators = React.lazy(() => import('./tools/MiscCalculators'));
const ImageTools = React.lazy(() => import('./tools/ImageTools'));
const ColorTools = React.lazy(() => import('./tools/ColorTools'));
const OutdoorTools = React.lazy(() => import('./tools/OutdoorTools'));
const PdfEdit = React.lazy(() => import('./tools/PdfEdit'));
const PdfSecure = React.lazy(() => import('./tools/PdfSecure'));
const PdfConvert = React.lazy(() => import('./tools/PdfConvert'));
const NetworkAnalyzer = React.lazy(() => import('./tools/NetworkAnalyzer'));
const ConnectivityTools = React.lazy(() => import('./tools/ConnectivityTools'));
const HardwareTools = React.lazy(() => import('./tools/HardwareTools'));
const DevTools = React.lazy(() => import('./tools/DevTools'));
const SystemManagement = React.lazy(() => import('./tools/SystemManagement'));
const UtilityTools = React.lazy(() => import('./tools/UtilityTools'));
const PrivacyDashboard = React.lazy(() => import('./tools/PrivacyDashboard'));
const QrScanner = React.lazy(() => import('./tools/QrScanner'));
const AmbientLightGraph = React.lazy(() => import('./tools/AmbientLightGraph'));
const SystemThermal = React.lazy(() => import('./tools/SystemThermal'));

const TOOLS = [
    // Measurements (6 Tools)
    { id: 'ruler', title: 'Ruler', icon: 'straighten', category: 'Measurements', component: Measurements },
    { id: 'level-pendulum', title: 'Level & Pendulum', icon: 'vibration', category: 'Measurements', component: Measurements },
    { id: 'protractor', title: 'Protractor', icon: 'architecture', category: 'Measurements', component: Measurements },
    { id: 'sunlight-graph', title: 'Sunlight Graph', icon: 'wb_sunny', category: 'Measurements', component: AmbientLightGraph },
    { id: 'soundmeter', title: 'Soundmeter', icon: 'volume_up', category: 'Measurements', component: HardwareTools },
    { id: 'magnetic-tester', title: 'Magnetic Tester', icon: 'explore', category: 'Measurements', component: Measurements },

    // Productivity (3 Tools)
    { id: 'tally-counter', title: 'Tally Counter', icon: 'add_circle_outline', category: 'Productivity', component: Counter },
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Productivity', component: Notes },
    { id: 'ai-summary', title: 'AI Summary', icon: 'auto_fix_high', category: 'Productivity', component: AiSummary },

    // Games (11 Tools)
    { id: 'dice-roller', title: 'Dice Roller', icon: 'casino', category: 'Games', component: DiceRoller },
    { id: 'spin-wheel', title: 'Spin the Wheel', icon: 'refresh', category: 'Games', component: Games },
    { id: 'spin-bottle', title: 'Spin the Bottle', icon: 'wine_bar', category: 'Games', component: Games },
    { id: 'team-maker', title: 'Team Maker', icon: 'groups', category: 'Games', component: Games },
    { id: 'tournament-maker', title: 'Tournament Maker', icon: 'account_tree', category: 'Games', component: Games },
    { id: 'scoreboard', title: 'Scoreboard', icon: 'scoreboard', category: 'Games', component: Games },
    { id: 'chess-clock', title: 'Chess Clock', icon: 'timer', category: 'Games', component: Games },
    { id: 'chess960', title: 'Chess960', icon: 'grid_view', category: 'Games', component: Games },
    { id: 'darts-scoreboard', title: 'Darts Scoreboard', icon: 'ads_click', category: 'Games', component: Games },

    // Text (9 Tools)
    { id: 'lorem-ipsum', title: 'Lorem Ipsum', icon: 'notes', category: 'Text', component: LoremIpsum },
    { id: 'url-shortener', title: 'URL Shortener', icon: 'link', category: 'Text', component: TextUtils },
    { id: 'character-counter', title: 'Character Counter', icon: 'format_list_numbered', category: 'Text', component: WordCounter },
    { id: 'emoji-text', title: 'Emoji Text', icon: 'mood', category: 'Text', component: TextUtils },
    { id: 'invisible-char', title: 'Invisible Character', icon: 'visibility_off', category: 'Text', component: TextUtils },
    { id: 'case-converter', title: 'Case Converter', icon: 'title', category: 'Text', component: TextUtils },
    { id: 'text-repeater', title: 'Text Repeater', icon: 'repeat', category: 'Text', component: TextUtils },
    { id: 'list-sorter', title: 'List Sorter', icon: 'sort', category: 'Text', component: TextUtils },
    { id: 'reverse-text', title: 'Reverse Text', icon: 'settings_backup_restore', category: 'Text', component: TextUtils },

    // Math (9 Tools)
    { id: 'percentages', title: 'Percentages', icon: 'percent', category: 'Math', component: MathTools },
    { id: 'geometry', title: 'Geometry', icon: 'architecture', category: 'Math', component: MathTools },
    { id: 'pythagoras', title: 'Pythagoras', icon: 'change_history', category: 'Math', component: MathTools },
    { id: 'proportions', title: 'Proportions', icon: 'balance', category: 'Math', component: MathTools },
    { id: 'ruffini', title: 'Ruffini', icon: 'reorder', category: 'Math', component: MathTools },
    { id: 'quadratic', title: 'Quadratic Equation', icon: 'functions', category: 'Math', component: MathTools },
    { id: 'fractions', title: 'Fractions', icon: 'vertical_align_center', category: 'Math', component: MathTools },
    { id: 'gcd-lcm', title: 'GCD & LCM', icon: 'format_list_numbered', category: 'Math', component: MathTools },
    { id: 'prime-factors', title: 'Prime Factors', icon: 'grid_3x3', category: 'Math', component: MathTools },

    // Generators (6 Tools)
    // Generators (4 Tools)
    { id: 'qr-gen', title: 'QR Code', icon: 'qr_code_2', category: 'Generators', component: QrGen },
    { id: 'qr-scan', title: 'QR Scanner', icon: 'qr_code_scanner', category: 'Generators', component: QrScanner },
    { id: 'barcode-gen', title: 'Barcode Generator', icon: 'barcode_reader', category: 'Generators', component: Generators },
    { id: 'password-gen', title: 'Password', icon: 'vpn_key', category: 'Generators', component: PasswordGenerator },
    { id: 'random-numbers', title: 'Random Numbers', icon: 'pin', category: 'Generators', component: Generators },
    { id: 'heads-tails', title: 'Heads or Tails', icon: 'monetization_on', category: 'Games', component: CoinFlipper },
    { id: 'magic-8ball', title: 'Magic 8-Ball', icon: 'filter_8', category: 'Games', component: Generators },

    // Calculators (6 Tools)
    { id: 'currency-conv', title: 'Currency Exchange', icon: 'payments', category: 'Calculators', component: CurrencyConverter },
    { id: 'tip-split', title: 'Tip & Split', icon: 'restaurant', category: 'Calculators', component: MiscCalculators },
    { id: 'bmi-metabolism', title: 'BMI & Metabolism', icon: 'person', category: 'Calculators', component: BMICalculator },
    { id: 'unit-converter', title: 'Unit Converter', icon: 'balance', category: 'Calculators', component: UnitConverter },
    { id: 'weighted-avg', title: 'Weighted Average', icon: 'show_chart', category: 'Calculators', component: MiscCalculators },
    { id: 'date-diff', title: 'Date Difference', icon: 'calendar_month', category: 'Calculators', component: MiscCalculators },

    // Finance (6 Tools)
    { id: 'vat-calc', title: 'VAT Calculator', icon: 'receipt_long', category: 'Finance', component: FinanceCalculators },
    { id: 'inflation', title: 'Inflation', icon: 'trending_up', category: 'Finance', component: FinanceCalculators },
    { id: 'loan-calc', title: 'Loan Calculator', icon: 'credit_card', category: 'Finance', component: FinanceCalculators },
    { id: 'compound-int', title: 'Compound Interest', icon: 'savings', category: 'Finance', component: FinanceCalculators },
    { id: 'cagr', title: 'CAGR', icon: 'query_stats', category: 'Finance', component: FinanceCalculators },
    { id: 'dcf', title: 'DCF', icon: 'account_balance', category: 'Finance', component: FinanceCalculators },

    // Images (6 Tools)
    { id: 'img-format', title: 'Format Converter', icon: 'transform', category: 'Images', component: ImageTools },
    { id: 'img-compress', title: 'Compressor', icon: 'compress', category: 'Images', component: ImageOptimizer },
    { id: 'img-resize', title: 'Resize Image', icon: 'aspect_ratio', category: 'Images', component: ImageTools },
    { id: 'img-blur', title: 'Privacy Blur', icon: 'blur_on', category: 'Images', component: ImageTools },
    { id: 'img-meta', title: 'Metadata Cleaner', icon: 'no_photography', category: 'Images', component: ImageTools },
    { id: 'img-bw', title: 'Black & White Filter', icon: 'filter_b_and_w', category: 'Images', component: ImageTools },

    // Outdoor (6 Tools)
    { id: 'sos', title: 'SOS', icon: 'warning', category: 'Outdoor', component: OutdoorTools },
    { id: 'compass', title: 'Compass', icon: 'explore', category: 'Outdoor', component: OutdoorTools },
    { id: 'gps-info', title: 'Altitude & GPS', icon: 'location_on', category: 'Outdoor', component: OutdoorTools },
    { id: 'freq-gen', title: 'Frequency Gen', icon: 'waves', category: 'Outdoor', component: OutdoorTools },
    { id: 'magnifier', title: 'Magnifying Glass', icon: 'zoom_in', category: 'Outdoor', component: OutdoorTools },
    { id: 'mirror', title: 'Mirror', icon: 'face', category: 'Outdoor', component: OutdoorTools },

    // Colors (7 Tools)
    { id: 'img-color', title: 'Image Color Picker', icon: 'colorize', category: 'Colors', component: ColorTools },
    { id: 'cam-color', title: 'Camera Color Picker', icon: 'camera', category: 'Colors', component: ColorTools },
    { id: 'color-conv', title: 'Color Converter', icon: 'autorenew', category: 'Colors', component: ColorTools },
    { id: 'tints-shades', title: 'Tints & Shades', icon: 'opacity', category: 'Colors', component: ColorTools },
    { id: 'color-harm', title: 'Color Harmonizer', icon: 'style', category: 'Colors', component: ColorTools },
    { id: 'color-blend', title: 'Color Blender', icon: 'format_color_fill', category: 'Colors', component: ColorTools },
    { id: 'color-picker-std', title: 'Color Picker', icon: 'palette', category: 'Colors', component: ColorPicker },

    // PDF Tools (Edit, Optimize, Secure)
    { id: 'pdf-merge', title: 'Merge PDF', icon: 'merge_type', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-split', title: 'Split PDF', icon: 'call_split', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-delete', title: 'Delete Pages', icon: 'delete', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-rearrange', title: 'Rearrange PDF', icon: 'low_priority', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-rotate', title: 'Rotate PDF', icon: 'rotate_right', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-sign', title: 'Sign PDF', icon: 'draw', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-watermark', title: 'Watermark PDF', icon: 'branding_watermark', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-numbers', title: 'Add Page Numbers', icon: 'format_list_numbered', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-bookmarks', title: 'PDF Bookmarks', icon: 'bookmark', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-crop', title: 'Crop PDF', icon: 'crop', category: 'PDF Tools', component: PdfEdit },
    { id: 'pdf-compress', title: 'Compress PDF', icon: 'compress', category: 'PDF Tools', component: PdfSecure },
    { id: 'pdf-grayscale', title: 'Grayscale PDF', icon: 'filter_b_and_w', category: 'PDF Tools', component: PdfSecure },
    { id: 'pdf-repair', title: 'Repair PDF', icon: 'build', category: 'PDF Tools', component: PdfSecure },
    { id: 'pdf-compare', title: 'Compare PDF', icon: 'difference', category: 'PDF Tools', component: PdfSecure },
    { id: 'pdf-flatten', title: 'Flatten PDF', icon: 'layers_clear', category: 'PDF Tools', component: PdfSecure },
    { id: 'pdf-lock', title: 'Lock PDF', icon: 'lock', category: 'PDF Tools', component: PdfSecure },
    { id: 'pdf-unlock', title: 'Unlock PDF', icon: 'lock_open', category: 'PDF Tools', component: PdfSecure },
    { id: 'pdf-meta', title: 'PDF Metadata', icon: 'info', category: 'PDF Tools', component: PdfSecure },

    // PDF Convert (Convert & Office)
    { id: 'pdf-to-img', title: 'PDF to Img', icon: 'image', category: 'PDF Convert', component: PdfConvert },
    { id: 'img-to-pdf', title: 'Img to PDF', icon: 'picture_as_pdf', category: 'PDF Convert', component: PdfConvert },
    { id: 'pdf-to-zip', title: 'PDF to ZIP', icon: 'folder_zip', category: 'PDF Convert', component: PdfConvert },
    { id: 'pdf-extract', title: 'Extract Assets', icon: 'file_download', category: 'PDF Convert', component: PdfConvert },
    { id: 'pdf-to-text', title: 'PDF to Text', icon: 'text_snippet', category: 'PDF Convert', component: PdfConvert },
    { id: 'word-to-pdf', title: 'Word to PDF', icon: 'description', category: 'PDF Convert', component: PdfConvert },
    { id: 'excel-to-pdf', title: 'Excel to PDF', icon: 'table_chart', category: 'PDF Convert', component: PdfConvert },
    { id: 'ppt-to-pdf', title: 'PPT to PDF', icon: 'slideshow', category: 'PDF Convert', component: PdfConvert },
    { id: 'pdf-to-word', title: 'PDF to Word', icon: 'article', category: 'PDF Convert', component: PdfConvert },
    { id: 'pdf-scan', title: 'Scan PDF (OCR)', icon: 'document_scanner', category: 'PDF Convert', component: PdfConvert },

    // Web Tools
    { id: 'translate', title: 'Translate', icon: 'translate', category: 'Web Tools', component: Translate },
    { id: 'url-tool', title: 'URL Tool', icon: 'link', category: 'Web Tools', component: UrlTool },
    { id: 'json-formatter', title: 'JSON Formatter', icon: 'code', category: 'Web Tools', component: JsonFormatter },
    { id: 'csv-json', title: 'CSV/JSON', icon: 'swap_horiz', category: 'Web Tools', component: CsvJsonConverter },
    { id: 'json-to-csv', title: 'JSON to CSV', icon: 'table_view', category: 'Web Tools', component: JsonToCsv },
    { id: 'json-validator', title: 'JSON Validator', icon: 'spellcheck', category: 'Web Tools', component: JsonValidator },
    { id: 'html-entities', title: 'HTML Entities', icon: 'html', category: 'Web Tools', component: HtmlEntities },
    { id: 'network-tools', title: 'Network', icon: 'timeline', category: 'Web Tools', component: NetworkTools },
    { id: 'cookies', title: 'Cookies', icon: 'cookie', category: 'Web Tools', component: Cookies },
    { id: 'inspect', title: 'Inspect', icon: 'search', category: 'Web Tools', component: Inspect },
    { id: 'omni-hub', title: 'Omni Hub', icon: 'public', category: 'Web Tools', component: OmniHub },

    // Dev Tools
    { id: 'http-client', title: 'HTTP Client', icon: 'send', category: 'Dev Tools', component: DevTools },
    { id: 'regex-tester', title: 'Regex Tester', icon: 'data_object', category: 'Dev Tools', component: DevTools },
    { id: 'jwt-decoder', title: 'JWT Decoder', icon: 'lock_open', category: 'Dev Tools', component: DevTools },
    { id: 'markdown-preview', title: 'Markdown', icon: 'article', category: 'Dev Tools', component: MarkdownPreview },
    { id: 'markdown-table', title: 'MD Table', icon: 'grid_on', category: 'Dev Tools', component: MarkdownTable },
    { id: 'diff-viewer', title: 'Diff Viewer', icon: 'difference', category: 'Dev Tools', component: DiffViewer },
    { id: 'base64-converter', title: 'Base64', icon: 'transform', category: 'Dev Tools', component: Base64Converter },
    { id: 'user-scripts', title: 'User Scripts', icon: 'add', category: 'Dev Tools', component: UserScripts },
    { id: 'cron-desc', title: 'Cron Explainer', icon: 'event_repeat', category: 'Dev Tools', component: CronExpressionDescriptor },

    // Security (Integration)
    { id: 'hash-gen', title: 'Hash Gen', icon: 'security', category: 'Security', component: HashGenerator },
    { id: 'uuid-gen', title: 'UUID Gen', icon: 'fingerprint', category: 'Security', component: UuidGenerator },
    { id: 'security-info', title: 'Security Info', icon: 'verified_user', category: 'Security', component: SecurityInfo },

    // System
    { id: 'device-info', title: 'Device Info', icon: 'memory', category: 'System', component: DeviceInfo },
    { id: 'thermal-health', title: 'Thermal Health', icon: 'thermostat', category: 'System', component: SystemThermal },
    { id: 'android-sensors', title: 'Sensors', icon: 'sensors', category: 'System', component: AndroidSensors },
    { id: 'network-analyzer', title: 'Network Analyzer', icon: 'troubleshoot', category: 'Web Tools', component: NetworkAnalyzer },
    { id: 'connectivity-tools', title: 'Connectivity', icon: 'settings_input_antenna', category: 'Web Tools', component: ConnectivityTools },
    { id: 'hardware-tools', title: 'Hardware', icon: 'developer_board', category: 'System', component: HardwareTools },
    { id: 'system-management', title: 'System Manager', icon: 'manage_accounts', category: 'System', component: SystemManagement },
    { id: 'utility-timer', title: 'Smart Timer', icon: 'timer', category: 'Time', component: UtilityTools },
    { id: 'privacy-dashboard', title: 'Privacy', icon: 'privacy_tip', category: 'Security', component: PrivacyDashboard },

    // Time
    { id: 'age-calculator', title: 'Age Calculator', icon: 'calendar_today', category: 'Time', component: AgeCalculator },
    { id: 'timestamp-conv', title: 'Timestamp', icon: 'schedule', category: 'Time', component: TimestampConverter },
    { id: 'stopwatch', title: 'Stopwatch', icon: 'timer', category: 'Time', component: Stopwatch },
    { id: 'pomodoro-timer', title: 'Pomodoro Timer', icon: 'schedule', category: 'Time', component: PomodoroTimer },
    { id: 'vibrometer', title: 'Vibrometer', icon: 'vibration', category: 'Time', component: HardwareTools },
    { id: 'metronome', title: 'Metronome', icon: 'timer', category: 'Time', component: Measurements },
    { id: 'reaction-time', title: 'Reaction Time', icon: 'bolt', category: 'Time', component: Measurements },
    { id: 'tabata-timer', title: 'Tabata Timer', icon: 'fitness_center', category: 'Time', component: Measurements },

    // Misc
    { id: 'panchangam', title: 'Panchangam', icon: 'auto_awesome', category: 'Misc', component: TeluguPanchangam },
    { id: 'morse', title: 'Morse', icon: 'timeline', category: 'Misc', component: MorseCode },

    // Specialized/Graviton
    { id: 'anomaly-detection', title: 'Anomaly Detection', icon: 'notifications_active', category: 'Specialized', component: AnomalyDetection },
    { id: 'data-quality', title: 'Data Quality', icon: 'verified', category: 'Specialized', component: DataQuality },
    { id: 'data-anonymizer', title: 'Data Anonymizer', icon: 'security', category: 'Security', component: DataAnonymizer },
    { id: 'observability', title: 'Observability', icon: 'visibility', category: 'Specialized', component: Observability },
    { id: 'data-portal', title: 'Data Portal', icon: 'dashboard', category: 'Specialized', component: DataPortal },
    { id: 'azure-integration', title: 'Azure Functions', icon: 'cloud', category: 'Specialized', component: AzureIntegration },
    { id: 'specialized-tools', title: 'Specialized Tools', icon: 'construction', category: 'Specialized', component: SpecializedTools },

    { id: 'calculator-main', title: 'Scientific Calc', icon: 'calculate', category: 'Calculators', component: Calculator },
];

const ToolboxView = ({
  searchQuery,
  groupToolbox,
  showStats,
  recentTools,
  setRecentTools,
  hideRecentTools,
  dashboardLayout,
  iconSize,
  hiddenTools = [],
  toolOrder = [],
  setToolOrder
}) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [pinnedTools, setPinnedTools] = useState(JSON.parse(localStorage.getItem('hub_pinned_tools') || '[]'));
  const [toolCustomizations, setToolCustomizations] = useState(JSON.parse(localStorage.getItem('hub_tool_custom') || '{}'));
  const [draggedToolId, setDraggedToolId] = useState(null);

  useEffect(() => {
    localStorage.setItem('hub_pinned_tools', JSON.stringify(pinnedTools));
  }, [pinnedTools]);

  useEffect(() => {
    localStorage.setItem('hub_tool_custom', JSON.stringify(toolCustomizations));
  }, [toolCustomizations]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    let newPinned;
    if (pinnedTools.includes(id)) {
      newPinned = pinnedTools.filter(t => t !== id);
    } else {
      newPinned = [id, ...pinnedTools];
    }
    setPinnedTools(newPinned);
    localStorage.setItem('hub_pinned_tools', JSON.stringify(newPinned));
  };

  const openTool = (id, skipHistory = false) => {
    setActiveToolId(id);
    setCurrentResult(null);
    const newRecents = [id, ...recentTools.filter(t => t !== id)].slice(0, 4);
    setRecentTools(newRecents);
    localStorage.setItem('hub_recent_tools', JSON.stringify(newRecents));

    if (!skipHistory) {
      window.history.pushState({ toolId: id }, '', window.location.pathname + `?tab=toolbox&tool=${id}`);
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.toolId) {
        openTool(event.state.toolId, true);
      } else {
        setActiveToolId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Handle initial tool from URL
    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('tool');
    if (toolId && TOOLS.find(t => t.id === toolId)) {
      openTool(toolId, true);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleShare = async (e, tool) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nature toolbox - ${tool.title}`,
          text: `Check out the ${tool.title} tool on Nature toolbox dashboard!`,
          url: window.location.origin + window.location.pathname + `?tab=toolbox&tool=${tool.id}`
        });
      } catch (err) { console.error("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + `?tab=toolbox&tool=${tool.id}`);
      alert("Tool link copied to clipboard!");
    }
  };

  const filteredTools = useMemo(() => {
    let base = TOOLS.filter(t => !hiddenTools.includes(t.id));

    // Sort based on toolOrder
    if (toolOrder.length > 0) {
      base.sort((a, b) => {
        const idxA = toolOrder.indexOf(a.id);
        const idxB = toolOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    return base.filter(t => {
      let matchesSearch = true;
      let matchesCat = true;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (query.startsWith('cat:')) {
          const catQuery = query.replace('cat:', '').trim();
          matchesCat = t.category.toLowerCase().includes(catQuery);
          matchesSearch = true;
        } else {
          matchesSearch = t.title.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query);
        }
      }

      if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
        if (activeCategory !== 'All') matchesCat = t.category === activeCategory;
      }

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory, hiddenTools, toolOrder]);

  const { grouped, cats } = useMemo(() => {
    const grouped = {};
    filteredTools.forEach(t => {
      (grouped[t.category] || (grouped[t.category] = [])).push(t);
    });
    // Sort tools within each category
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => a.title.localeCompare(b.title));
    });
    return { grouped, cats: Object.keys(grouped).sort() };
  }, [filteredTools]);

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const collapseAll = () => {
    const newCollapsed = {};
    cats.forEach(cat => newCollapsed[cat] = true);
    setCollapsedCategories(newCollapsed);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const stats = useMemo(() => {
    const s = {};
    TOOLS.forEach(t => {
      s[t.category] = (s[t.category] || 0) + 1;
    });
    return s;
  }, []);

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const updateToolCustomization = (id, data) => {
    setToolCustomizations(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...data }
    }));
  };

  const handleDragStart = (id) => {
    setDraggedToolId(id);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (!draggedToolId || draggedToolId === id) return;

    const currentOrder = toolOrder.length > 0 ? [...toolOrder] : TOOLS.map(t => t.id);
    const draggedIdx = currentOrder.indexOf(draggedToolId);
    const targetIdx = currentOrder.indexOf(id);

    if (draggedIdx > -1 && targetIdx > -1) {
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedToolId);
      if (setToolOrder) setToolOrder(newOrder);
    }
  };

  const handleDragEnd = () => {
    setDraggedToolId(null);
    if (navigator.vibrate) navigator.vibrate([20, 10]);
  };

  const handleCopyResult = () => {
    if (!currentResult?.text) return;
    navigator.clipboard.writeText(currentResult.text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadResult = () => {
    if (!currentResult) return;
    const { text, blob, filename } = currentResult;
    const finalBlob = blob || new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (activeToolId) {
    const tool = TOOLS.find(t => t.id === activeToolId);
    return (
      <div className="tool-view">
        <div className="tool-view-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <button className="icon-btn" onClick={() => { setActiveToolId(null); window.history.back(); }} title="Back to Toolbox" style={{ background: 'var(--nature-mist)', borderRadius: 'var(--pebble-2)' }}>
              <span className="material-icons">arrow_back</span>
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div className="card-icon" style={{ borderRadius: 'var(--pebble-1)' }}>
                <span className="material-icons" style={{fontSize: '1.75rem'}}>{tool.icon}</span>
              </div>
              <h2 style={{margin: 0, fontSize: '2rem', fontWeight: 800}}>{tool.title}</h2>
            </div>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            {currentResult?.text && (
              <button className={`icon-btn ${copySuccess ? 'copy-success' : ''}`} onClick={handleCopyResult} title="Copy Result" style={{ background: 'var(--nature-mist)', borderRadius: 'var(--pebble-3)' }}>
                <span className="material-icons">{copySuccess ? 'check' : 'content_copy'}</span>
              </button>
            )}
            {currentResult && (
              <button className="icon-btn" onClick={handleDownloadResult} title="Download Result" style={{ background: 'var(--nature-mist)', borderRadius: 'var(--pebble-2)' }}>
                <span className="material-icons">download</span>
              </button>
            )}
          </div>
        </div>
        <div className="tool-container-inner">
          <ErrorBoundary>
            <React.Suspense fallback={
              <div className="loading-seed">
                <span className="material-icons seed-icon">spa</span>
                <p>Nurturing tool...</p>
              </div>
            }>
              {tool.component ? <tool.component onResultChange={setCurrentResult} toolId={tool.id} /> : (
                <NatureEmptyState
                  title="Under Growth"
                  body="This tool is still a seedling. Check back soon!"
                />
              )}
            </React.Suspense>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  const toolboxCategories = {};
  [...new Set(TOOLS.map(t => t.category))].forEach(cat => {
    toolboxCategories[cat] = getCategoryIcon(cat);
  });

  return (
    <>
      <CategoryNav
        categories={toolboxCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showStats={showStats}
        stats={stats}
        totalCount={TOOLS.length}
      />

      <div className="toolbox-page-header">
        <h2>Toolbox</h2>
        <p>Collection of useful offline utilities.</p>
        {groupToolbox && cats.length > 0 && (
          <div className="pill-group" style={{justifyContent: 'center', marginTop: '1rem'}}>
            <button className="pill" onClick={collapseAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_less</span> Collapse All
            </button>
            <button className="pill" onClick={expandAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_more</span> Expand All
            </button>
          </div>
        )}
      </div>

      {activeCategory === 'All' && !searchQuery && (
        <div style={{ padding: '0 10px', marginBottom: '2rem' }}>
          {pinnedTools.length > 0 && (
            <div className="favorites-bar" style={{ marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem' }}>star</span> Favorites
              </h3>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                {pinnedTools.map(id => {
                  const tool = TOOLS.find(t => t.id === id);
                  if (!tool) return null;
                  return (
                    <div key={id} className="fav-item" onClick={() => openTool(tool.id)} style={{
                      flexShrink: 0,
                      width: '80px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div className="fav-icon-wrapper">
                        <span className="material-icons">{tool.icon}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{tool.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {recentTools.length > 0 && !hideRecentTools && (
            <div className="history-section" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem' }}>history</span> History
              </h3>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                {recentTools.filter(id => !pinnedTools.includes(id)).map(id => {
                  const tool = TOOLS.find(t => t.id === id);
                  if (!tool) return null;
                  return (
                    <div key={id} className="history-item" onClick={() => openTool(tool.id)}>
                      <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{tool.icon}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{tool.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {filteredTools.length === 0 ? (
        <NatureEmptyState />
      ) : !groupToolbox ? (
        <div className={`category-grid ${dashboardLayout === 'list' ? 'list-view' : ''}`} style={{padding: '0 10px', gridTemplateColumns: dashboardLayout === 'list' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'}}>
           {filteredTools.map((tool, idx) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                idx={idx}
                isPinned={pinnedTools.includes(tool.id)}
                isDragged={draggedToolId === tool.id}
                togglePin={togglePin}
                handleShare={handleShare}
                openTool={openTool}
                searchQuery={searchQuery}
                highlightText={highlightText}
                layout={dashboardLayout}
                size={iconSize}
                onDragStart={() => handleDragStart(tool.id)}
                onDragOver={(e) => handleDragOver(e, tool.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
        </div>
      ) : (
        cats.map(cat => (
          <div key={cat} className={`category-section ${collapsedCategories[cat] ? 'collapsed' : ''}`}>
            <div className="category-header" onClick={() => toggleCategoryCollapse(cat)}>
              <div className="category-title">
                <span className="material-icons">{getCategoryIcon(cat)}</span>
                {cat}
                {showStats && <span className="count">{grouped[cat].length}</span>}
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className={`category-grid ${dashboardLayout === 'list' ? 'list-view' : ''}`} style={{gridTemplateColumns: dashboardLayout === 'list' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'}}>
              {grouped[cat].map((tool, idx) => (
                <ToolCard
                    key={tool.id}
                    tool={tool}
                    idx={idx}
                    isPinned={pinnedTools.includes(tool.id)}
                    isDragged={draggedToolId === tool.id}
                    togglePin={togglePin}
                    handleShare={handleShare}
                    openTool={openTool}
                    searchQuery={searchQuery}
                    highlightText={highlightText}
                    layout={dashboardLayout}
                    size={iconSize}
                    onDragStart={() => handleDragStart(tool.id)}
                    onDragOver={(e) => handleDragOver(e, tool.id)}
                    onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const ToolCard = memo(({ tool, idx, isPinned, isDragged, togglePin, handleShare, openTool, searchQuery, highlightText, layout = 'grid', size = 'medium', onDragStart, onDragOver, onDragEnd }) => {
  const iconSizeMap = { small: '1.25rem', medium: '1.5rem', large: '2rem' };
  const cardPaddingMap = { small: '12px', medium: '1.5rem', large: '2rem' };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openTool(tool.id);
    }
  };

  return (
    <div
      id={`card-${tool.id}`}
      className={`card ${layout}-item ${isDragged ? 'is-dragging' : ''}`}
      tabIndex="0"
      role="button"
      aria-label={`Open ${tool.title}`}
      onKeyDown={handleKeyDown}
      draggable="true"
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      style={{
        '--delay': idx,
        padding: cardPaddingMap[size],
        flexDirection: layout === 'list' ? 'row' : 'column',
        alignItems: layout === 'list' ? 'center' : 'stretch'
      }}
      onClick={() => openTool(tool.id)}
    >
       <div className="card-actions">
            <button className={`pin-btn ${isPinned ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)} title="Pin Tool">
                <span className="material-icons" style={{fontSize: '1.1rem'}}>push_pin</span>
            </button>
            <button onClick={(e) => handleShare(e, tool)} title="Share Tool">
                <span className="material-icons" style={{fontSize: '1.1rem'}}>share</span>
            </button>
       </div>
       <div className="card-header" style={{ marginBottom: layout === 'list' ? 0 : '1rem', flex: layout === 'list' ? 1 : 'unset' }}>
            <div className="card-icon">
                <span className="material-icons" style={{ fontSize: iconSizeMap[size] }}>{tool.icon}</span>
            </div>
            <div className="card-title">
              {searchQuery ? (
                <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightText(tool.title, searchQuery)) }} />
              ) : (
                tool.title
              )}
            </div>
        </div>
    </div>
  );
});

const getCategoryIcon = (cat) => {
    const icons = {
        'Measurements': 'architecture',
        'Games': 'extension',
        'Text': 'edit_note',
        'Math': 'functions',
        'Generators': 'auto_awesome',
        'Calculators': 'calculate',
        'Finance': 'savings',
        'Images': 'filter_hdr',
        'Outdoor': 'park',
        'Colors': 'palette',
        'PDF Tools': 'description',
        'PDF Convert': 'swap_calls',
        'Web Tools': 'water_drop',
        'Dev Tools': 'terminal',
        'Misc': 'hive',
        'Specialized': 'biotech',
        'Time': 'schedule',
        'Security': 'security',
        'Productivity': 'eco',
    };
    return icons[cat] || 'folder';
};

export default ToolboxView;
