import React, { useState, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { storage } from '../utils/storage';
import CategoryNav from './CategoryNav';
import NatureEmptyState from './NatureEmptyState';

// Lazy Loaded Tools
const Calculator = lazy(() => import('./tools/Calculator'));
const QrGen = lazy(() => import('./tools/QrGen'));
const PasswordGenerator = lazy(() => import('./tools/PasswordGenerator'));
const UnitConverter = lazy(() => import('./tools/UnitConverter'));
const CurrencyConverter = lazy(() => import('./tools/CurrencyConverter'));
const Stopwatch = lazy(() => import('./tools/Stopwatch'));
const Notes = lazy(() => import('./tools/Notes'));
const Translate = lazy(() => import('./tools/Translate'));
const MorseCode = lazy(() => import('./tools/MorseCode'));
const AgeCalculator = lazy(() => import('./tools/AgeCalculator'));
const BMICalculator = lazy(() => import('./tools/BMICalculator'));
const ColorPicker = lazy(() => import('./tools/ColorPicker'));
const TimestampConverter = lazy(() => import('./tools/TimestampConverter'));
const LoremIpsum = lazy(() => import('./tools/LoremIpsum'));
const TextUtils = lazy(() => import('./tools/TextUtils'));
const WordCounter = lazy(() => import('./tools/WordCounter'));
const WordRankCalculator = lazy(() => import('./tools/WordRankCalculator'));
const JsonFormatter = lazy(() => import('./tools/JsonFormatter'));
const CsvJsonConverter = lazy(() => import('./tools/CsvJsonConverter'));
const ImageOptimizer = lazy(() => import('./tools/ImageOptimizer'));
const Base64Converter = lazy(() => import('./tools/Base64Converter'));
const DeviceInfo = lazy(() => import('./tools/DeviceInfo'));
const AndroidSensors = lazy(() => import('./tools/AndroidSensors'));
const PomodoroTimer = lazy(() => import('./tools/PomodoroTimer'));
const MarkdownPreview = lazy(() => import('./tools/MarkdownPreview'));
const TeluguPanchangam = lazy(() => import('./tools/TeluguPanchangam'));
const AiSummary = lazy(() => import('./tools/AiSummary'));
const OmniHub = lazy(() => import('./tools/OmniHub'));
const NetworkTools = lazy(() => import('./tools/NetworkTools'));
const Cookies = lazy(() => import('./tools/Cookies'));
const Inspect = lazy(() => import('./tools/Inspect'));
const UrlTool = lazy(() => import('./tools/UrlTool'));
const SecurityInfo = lazy(() => import('./tools/SecurityInfo'));
const UserScripts = lazy(() => import('./tools/UserScripts'));
const DiffViewer = lazy(() => import('./tools/DiffViewer'));
const AnomalyDetection = lazy(() => import('./tools/AnomalyDetection'));
const HashGenerator = lazy(() => import('./tools/HashGenerator'));
const GlassGenerator = lazy(() => import('./tools/GlassGenerator'));
const JsonToCsv = lazy(() => import('./tools/JsonToCsv'));
const JsonValidator = lazy(() => import('./tools/JsonValidator'));
const AspectRatioCalc = lazy(() => import('./tools/AspectRatioCalc'));
const HtmlEntities = lazy(() => import('./tools/HtmlEntities'));
const CronExpressionDescriptor = lazy(() => import('./tools/CronExpressionDescriptor'));
const DataQuality = lazy(() => import('./tools/DataQuality'));
const DataAnonymizer = lazy(() => import('./tools/DataAnonymizer'));
const Observability = lazy(() => import('./tools/Observability'));
const DataPortal = lazy(() => import('./tools/DataPortal'));
const AzureIntegration = lazy(() => import('./tools/AzureIntegration'));
const SpecializedTools = lazy(() => import('./tools/SpecializedTools'));
const UuidGenerator = lazy(() => import('./tools/UuidGenerator'));
const DiceRoller = lazy(() => import('./tools/DiceRoller'));
const CoinFlipper = lazy(() => import('./tools/CoinFlipper'));
const Counter = lazy(() => import('./tools/Counter'));
const MarkdownTable = lazy(() => import('./tools/MarkdownTable'));
const Measurements = lazy(() => import('./tools/Measurements'));
const Games = lazy(() => import('./tools/Games'));
const MathTools = lazy(() => import('./tools/MathTools'));
const Generators = lazy(() => import('./tools/Generators'));
const FinanceCalculators = lazy(() => import('./tools/FinanceCalculators'));
const MiscCalculators = lazy(() => import('./tools/MiscCalculators'));
const ImageTools = lazy(() => import('./tools/ImageTools'));
const ColorTools = lazy(() => import('./tools/ColorTools'));
const OutdoorTools = lazy(() => import('./tools/OutdoorTools'));
const PdfEdit = lazy(() => import('./tools/PdfEdit'));
const PdfSecure = lazy(() => import('./tools/PdfSecure'));
const PdfConvert = lazy(() => import('./tools/PdfConvert'));
const SocialTools = lazy(() => import('./tools/SocialTools'));
const WebToMarkdown = lazy(() => import('./tools/WebToMarkdown'));
const NatureSounds = lazy(() => import('./tools/NatureSounds'));
const WaterReminder = lazy(() => import('./tools/WaterReminder'));

const TOOLS = [
    // Measurements (6 Tools)
    { id: 'ruler', title: 'Ruler', icon: 'straighten', category: 'Measurements', component: Measurements },
    { id: 'level-pendulum', title: 'Level & Pendulum', icon: 'vibration', category: 'Measurements', component: Measurements },
    { id: 'protractor', title: 'Protractor', icon: 'architecture', category: 'Measurements', component: Measurements },
    { id: 'luxmeter', title: 'Luxmeter', icon: 'light_mode', category: 'Measurements', component: Measurements },
    { id: 'soundmeter', title: 'Soundmeter', icon: 'volume_up', category: 'Measurements', component: Measurements },
    { id: 'magnetic-tester', title: 'Magnetic Tester', icon: 'explore', category: 'Measurements', component: Measurements },

    // Productivity
    { id: 'tally-counter', title: 'Tally Counter', icon: 'add_circle_outline', category: 'Productivity', component: Counter },
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Productivity', component: Notes },
    { id: 'ai-summary', title: 'AI Summary', icon: 'auto_fix_high', category: 'Productivity', component: AiSummary },
    { id: 'water-reminder', title: 'Water Reminder', icon: 'local_drink', category: 'Productivity', component: WaterReminder },
    { id: 'nature-sounds', title: 'Nature Sounds', icon: 'filter_drama', category: 'Productivity', component: NatureSounds },

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

    // Generators
    { id: 'qr-gen', title: 'QR Code', icon: 'qr_code_2', category: 'Generators', component: QrGen },
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

    // Social Tools
    { id: 'social-downloader', title: 'Social Downloader', icon: 'download', category: 'Social', component: SocialTools },
    { id: 'whatsapp-link', title: 'WhatsApp Link', icon: 'chat', category: 'Social', component: SocialTools },
    { id: 'telegram-link', title: 'Telegram Link', icon: 'send', category: 'Social', component: SocialTools },
    { id: 'hashtag-gen', title: 'Hashtag Gen', icon: 'tag', category: 'Social', component: SocialTools },

    // Web Tools
    { id: 'web-to-md', title: 'Web to MD', icon: 'article', category: 'Web Tools', component: WebToMarkdown },

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
    { id: 'android-sensors', title: 'Sensors', icon: 'sensors', category: 'System', component: AndroidSensors },

    // Time
    { id: 'age-calculator', title: 'Age Calculator', icon: 'calendar_today', category: 'Time', component: AgeCalculator },
    { id: 'timestamp-conv', title: 'Timestamp', icon: 'schedule', category: 'Time', component: TimestampConverter },
    { id: 'stopwatch', title: 'Stopwatch', icon: 'timer', category: 'Time', component: Stopwatch },
    { id: 'pomodoro-timer', title: 'Pomodoro Timer', icon: 'schedule', category: 'Time', component: PomodoroTimer },
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

const ToolboxView = ({ searchQuery, groupToolbox, showStats, recentTools, setRecentTools, hideRecentTools }) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [pinnedTools, setPinnedTools] = useState(storage.getJSON('hub_pinned_tools', []));

  useEffect(() => {
    storage.setJSON('hub_pinned_tools', pinnedTools);
  }, [pinnedTools]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    let newPinned;
    if (pinnedTools.includes(id)) {
      newPinned = pinnedTools.filter(t => t !== id);
    } else {
      newPinned = [id, ...pinnedTools];
    }
    setPinnedTools(newPinned);
  };

  const openTool = (id, skipHistory = false) => {
    setActiveToolId(id);
    setCurrentResult(null);

    const tool = TOOLS.find(t => t.id === id);
    if (tool) {
      const newRecents = [id, ...recentTools.filter(t => t !== id)].slice(0, 4);
      setRecentTools(newRecents);
      storage.setJSON('hub_recent_tools', newRecents);
    }

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
    if (toolId) {
      setActiveToolId(toolId);
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

  const filteredTools = useMemo(() => TOOLS.filter(t => {
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
  }), [searchQuery, activeCategory]);

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

  const stats = {};
  TOOLS.forEach(t => {
    stats[t.category] = (stats[t.category] || 0) + 1;
  });

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
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
    if (!tool) {
      return (
        <div className="tool-view">
          <div className="tool-view-header">
            <button className="icon-btn" onClick={() => { setActiveToolId(null); window.history.back(); }} title="Back to Toolbox">
              <span className="material-icons">arrow_back</span>
            </button>
            <h2 className="m-0">Tool Not Found</h2>
          </div>
          <NatureEmptyState
            title="Lost in the woods?"
            body="The tool you're looking for doesn't seem to exist in our toolbox."
            action={{ label: "Back to Toolbox", onClick: () => { setActiveToolId(null); window.history.back(); } }}
          />
        </div>
      );
    }
    return (
      <div className="tool-view">
        <div className="tool-view-header">
          <div className="flex-center" style={{ gap: '12px' }}>
            <button className="icon-btn" onClick={() => { setActiveToolId(null); window.history.back(); }} title="Back to Toolbox">
              <span className="material-icons">arrow_back</span>
            </button>
            <div className="flex-center" style={{ gap: '12px' }}>
              <span className="material-icons" style={{fontSize: '2rem', color: 'var(--primary)'}}>{tool.icon}</span>
              <h2 className="m-0" style={{ fontSize: '1.75rem' }}>{tool.title}</h2>
            </div>
          </div>
          <div className="flex-center" style={{ gap: '10px' }}>
            {currentResult?.text && (
              <button className={`icon-btn ${copySuccess ? 'copy-success' : ''}`} onClick={handleCopyResult} title="Copy Result">
                <span className="material-icons">{copySuccess ? 'check' : 'content_copy'}</span>
              </button>
            )}
            {currentResult && (
              <button className="icon-btn" onClick={handleDownloadResult} title="Download Result">
                <span className="material-icons">download</span>
              </button>
            )}
          </div>
        </div>
        <div className="tool-container-inner">
          <Suspense fallback={<div className="text-center p-20"><span className="material-icons rotating">refresh</span> Loading tool...</div>}>
            {tool.component ? <tool.component onResultChange={setCurrentResult} toolId={tool.id} /> : <div className="text-center p-20 opacity-5">This tool is under development.</div>}
          </Suspense>
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
          {(pinnedTools.length > 0 || (recentTools.length > 0 && !hideRecentTools)) && (
            <div className="toolbox-special-sections" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {pinnedTools.length > 0 && (
                <div className="special-section">
                  <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>push_pin</span> Pinned
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {pinnedTools.map(id => {
                      const tool = TOOLS.find(t => t.id === id);
                      if (!tool) return null;
                      return (
                        <div key={id} className="card" style={{ padding: '12px 16px', minHeight: 'unset', animation: 'none' }} onClick={() => openTool(tool.id)}>
                          <div className="card-header" style={{ marginBottom: 0, gap: '12px' }}>
                            <span className="material-icons" style={{ color: 'var(--primary)' }}>{tool.icon}</span>
                            <span style={{ fontWeight: 600 }}>{tool.title}</span>
                          </div>
                          <div className="card-actions">
                            <button className="pin-btn active" onClick={(e) => togglePin(e, tool.id)}><span className="material-icons">push_pin</span></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {recentTools.length > 0 && !hideRecentTools && (
                <div className="special-section">
                  <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>history</span> Recent
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {recentTools.filter(id => !pinnedTools.includes(id)).map(id => {
                      const tool = TOOLS.find(t => t.id === id);
                      if (!tool) return null;
                      return (
                        <div key={id} className="card" style={{ padding: '12px 16px', minHeight: 'unset', animation: 'none' }} onClick={() => openTool(tool.id)}>
                          <div className="card-header" style={{ marginBottom: 0, gap: '12px' }}>
                            <span className="material-icons" style={{ color: 'var(--text-muted)' }}>{tool.icon}</span>
                            <span style={{ fontWeight: 600 }}>{tool.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {filteredTools.length === 0 ? (
        <NatureEmptyState
          title={searchQuery ? "No matching tools" : "The toolbox is empty"}
          body={searchQuery ? `No tools match "${searchQuery}". Try a different search.` : "Wait for the seeds to grow or check back later."}
        />
      ) : !groupToolbox ? (
        <div className="category-grid" style={{padding: '0 10px'}}>
           {filteredTools.map((tool, idx) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                idx={idx}
                isPinned={pinnedTools.includes(tool.id)}
                togglePin={togglePin}
                handleShare={handleShare}
                openTool={openTool}
                searchQuery={searchQuery}
                highlightText={highlightText}
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
            <div className="category-grid">
              {grouped[cat].map((tool, idx) => (
                <ToolCard
                    key={tool.id}
                    tool={tool}
                    idx={idx}
                    isPinned={pinnedTools.includes(tool.id)}
                    togglePin={togglePin}
                    handleShare={handleShare}
                    openTool={openTool}
                    searchQuery={searchQuery}
                    highlightText={highlightText}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const ToolCard = memo(({ tool, idx, isPinned, togglePin, handleShare, openTool, searchQuery, highlightText }) => (
    <div id={`card-${tool.id}`} className="card" style={{'--delay': idx}} onClick={() => openTool(tool.id)}>
       <div className="card-actions">
            <button className={`pin-btn ${isPinned ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)} title="Pin Tool">
                <span className="material-icons">push_pin</span>
            </button>
            <button onClick={(e) => handleShare(e, tool)} title="Share Tool">
                <span className="material-icons">share</span>
            </button>
       </div>
       <div className="card-header">
            <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)'}}>
                <span className="material-icons">{tool.icon}</span>
            </div>
            <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(tool.title, searchQuery) }} />
        </div>
    </div>
));

const getCategoryIcon = (cat) => {
    const icons = {
        'Measurements': 'straighten',
        'Games': 'casino',
        'Text': 'title',
        'Math': 'functions',
        'Generators': 'qr_code',
        'Calculators': 'calculate',
        'Finance': 'account_balance',
        'Images': 'image',
        'Outdoor': 'explore',
        'Colors': 'palette',
        'PDF Tools': 'picture_as_pdf',
        'PDF Convert': 'transform',
        'Web Tools': 'public',
        'Dev Tools': 'terminal',
        'Misc': 'auto_fix_high',
        'Specialized': 'insights',
        'Time': 'schedule',
        'Security': 'security',
        'Productivity': 'assignment',
    };
    return icons[cat] || 'folder';
};

export default ToolboxView;
