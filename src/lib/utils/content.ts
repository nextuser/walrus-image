import { Content } from "next/font/google";
export enum ContentType {
    AudioAac = 0,
    ApplicationXabiword = 1,
    ImageApng = 2,
    ApplicationXfreearc = 3,
    ImageAvif = 4,
    VideoXmsvideo = 5,
    ApplicationVndamazonebook = 6,
    ApplicationOctetstream = 7,
    ImageBmp = 8,
    ApplicationXbzip = 9,
    ApplicationXbzip2 = 10,
    ApplicationXcdf = 11,
    ApplicationXcsh = 12,
    TextCss = 13,
    TextCsv = 14,
    ApplicationMsword = 15,
    ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument = 16,
    ApplicationVndmsfontobject = 17,
    ApplicationEpubzip = 18,
    ApplicationGzip = 19,
    ImageGif = 20,
    TextHtml = 21,
    ImageVndmicrosofticon = 22,
    TextCalendar = 23,
    ApplicationJavaarchive = 24,
    ImageJpeg = 25,
    TextJavascript = 26,
    ApplicationJson = 27,
    ApplicationLdjson = 28,
    AudioMidi = 29,
    AudioMpeg = 30,
    VideoMp4 = 31,
    VideoMpeg = 32,
    ApplicationVndappleinstallerxml = 33,
    ApplicationVndoasisopendocumentpresentation = 34,
    ApplicationVndoasisopendocumentspreadsheet = 35,
    ApplicationVndoasisopendocumenttext = 36,
    AudioOgg = 37,
    VideoOgg = 38,
    ApplicationOgg = 39,
    AudioOpus = 40,
    FontOtf = 41,
    ImagePng = 42,
    ApplicationPdf = 43,
    ApplicationXhttpdphp = 44,
    ApplicationVndmspowerpoint = 45,
    ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation = 46,
    ApplicationVndrar = 47,
    ApplicationRtf = 48,
    ApplicationXsh = 49,
    ImageSvgxml = 50,
    ApplicationXtar = 51,
    ImageTiff = 52,
    VideoMp2t = 53,
    FontTtf = 54,
    TextPlain = 55,
    ApplicationVndvisio = 56,
    AudioWav = 57,
    AudioWebm = 58,
    VideoWebm = 59,
    ImageWebp = 60,
    FontWoff = 61,
    FontWoff2 = 62,
    ApplicationXhtmlxml = 63,
    ApplicationVndmsexcel = 64,
    ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet = 65,
    ApplicationXml = 66,
    ApplicationVndmozillaxulxml = 67,
    ApplicationZip = 68,
    ApplicationX7zcompressed = 69,
    Unknown = 255
}

// 根据文件扩展名获取ContentType
export function getContentTypeByExtType(ext: string | undefined): ContentType  {
    switch (ext) {
        case "aac":
            return ContentType.AudioAac;
        case "abw":
            return ContentType.ApplicationXabiword;
        case "apng":
            return ContentType.ImageApng;
        case "arc":
            return ContentType.ApplicationXfreearc;
        case "avif":
            return ContentType.ImageAvif;
        case "avi":
            return ContentType.VideoXmsvideo;
        case "azw":
            return ContentType.ApplicationVndamazonebook;
        case "bin":
            return ContentType.ApplicationOctetstream;
        case "bmp":
            return ContentType.ImageBmp;
        case "bz":
            return ContentType.ApplicationXbzip;
        case "bz2":
            return ContentType.ApplicationXbzip2;
        case "cda":
            return ContentType.ApplicationXcdf;
        case "csh":
            return ContentType.ApplicationXcsh;
        case "css":
            return ContentType.TextCss;
        case "csv":
            return ContentType.TextCsv;
        case "doc":
            return ContentType.ApplicationMsword;
        case "docx":
            return ContentType.ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument;
        case "eot":
            return ContentType.ApplicationVndmsfontobject;
        case "epub":
            return ContentType.ApplicationEpubzip;
        case "gz":
            return ContentType.ApplicationGzip;
        case "gif":
            return ContentType.ImageGif;
        case "htm":
        case "html":
            return ContentType.TextHtml;
        case "ico":
            return ContentType.ImageVndmicrosofticon;
        case "ics":
            return ContentType.TextCalendar;
        case "jar":
            return ContentType.ApplicationJavaarchive;
        case "jpeg":
        case "jpg":
            return ContentType.ImageJpeg;
        case "js":
        case "mjs":
            return ContentType.TextJavascript;
        case "json":
            return ContentType.ApplicationJson;
        case "jsonld":
            return ContentType.ApplicationLdjson;
        case "mid":
        case "midi":
            return ContentType.AudioMidi;
        case "mp3":
            return ContentType.AudioMpeg;
        case "mp4":
            return ContentType.VideoMp4;
        case "mpeg":
            return ContentType.VideoMpeg;
        case "mpkg":
            return ContentType.ApplicationVndappleinstallerxml;
        case "odp":
            return ContentType.ApplicationVndoasisopendocumentpresentation;
        case "ods":
            return ContentType.ApplicationVndoasisopendocumentspreadsheet;
        case "odt":
            return ContentType.ApplicationVndoasisopendocumenttext;
        case "oga":
            return ContentType.AudioOgg;
        case "ogv":
        case "ogg":
            return ContentType.VideoOgg;
        case "ogx":
            return ContentType.ApplicationOgg;
        case "opus":
            return ContentType.AudioOpus;
        case "otf":
            return ContentType.FontOtf;
        case "png":
            return ContentType.ImagePng;
        case "pdf":
            return ContentType.ApplicationPdf;
        case "php":
            return ContentType.ApplicationXhttpdphp;
        case "ppt":
            return ContentType.ApplicationVndmspowerpoint;
        case "pptx":
            return ContentType.ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation;
        case "rar":
            return ContentType.ApplicationVndrar;
        case "rtf":
            return ContentType.ApplicationRtf;
        case "sh":
            return ContentType.ApplicationXsh;
        case "svg":
            return ContentType.ImageSvgxml;
        case "tar":
            return ContentType.ApplicationXtar;
        case "tif":
        case "tiff":
            return ContentType.ImageTiff;
        case "ts":
            return ContentType.VideoMp2t;
        case "ttf":
            return ContentType.FontTtf;
        case "txt":
            return ContentType.TextPlain;
        case "vsd":
            return ContentType.ApplicationVndvisio;
        case "wav":
            return ContentType.AudioWav;
        case "weba":
            return ContentType.AudioWebm;
        case "webm":
            return ContentType.VideoWebm;
        case "webp":
            return ContentType.ImageWebp;
        case "woff":
            return ContentType.FontWoff;
        case "woff2":
            return ContentType.FontWoff2;
        case "xhtml":
            return ContentType.ApplicationXhtmlxml;
        case "xls":
            return ContentType.ApplicationVndmsexcel;
        case "xlsx":
            return ContentType.ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet;
        case "xml":
            return ContentType.ApplicationXml;
        case "xul":
            return ContentType.ApplicationVndmozillaxulxml;
        case "zip":
            return ContentType.ApplicationZip;
        case "7z":
            return ContentType.ApplicationX7zcompressed;
        default:
            return ContentType.Unknown;
    }
}

// 将ContentType转换为字符串表示
export function getMimeTypeByContentType(contentType: number): string {
    switch (contentType) {
        case ContentType.AudioAac:
            return "audio/aac";
        case ContentType.ApplicationXabiword:
            return "application/x-abiword";
        case ContentType.ImageApng:
            return "image/apng";
        case ContentType.ApplicationXfreearc:
            return "application/x-freearc";
        case ContentType.ImageAvif:
            return "image/avif";
        case ContentType.VideoXmsvideo:
            return "video/x-msvideo";
        case ContentType.ApplicationVndamazonebook:
            return "application/vnd.amazon.ebook";
        case ContentType.ApplicationOctetstream:
            return "application/octet-stream";
        case ContentType.ImageBmp:
            return "image/bmp";
        case ContentType.ApplicationXbzip:
            return "application/x-bzip";
        case ContentType.ApplicationXbzip2:
            return "application/x-bzip2";
        case ContentType.ApplicationXcdf:
            return "application/x-cdf";
        case ContentType.ApplicationXcsh:
            return "application/x-csh";
        case ContentType.TextCss:
            return "text/css";
        case ContentType.TextCsv:
            return "text/csv";
        case ContentType.ApplicationMsword:
            return "application/msword";
        case ContentType.ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument:
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case ContentType.ApplicationVndmsfontobject:
            return "application/vnd.ms-fontobject";
        case ContentType.ApplicationEpubzip:
            return "application/epub+zip";
        case ContentType.ApplicationGzip:
            return "application/gzip";
        case ContentType.ImageGif:
            return "image/gif";
        case ContentType.TextHtml:
            return "text/html";
        case ContentType.ImageVndmicrosofticon:
            return "image/vnd.microsoft.icon";
        case ContentType.TextCalendar:
            return "text/calendar";
        case ContentType.ApplicationJavaarchive:
            return "application/java-archive";
        case ContentType.ImageJpeg:
            return "image/jpeg";
        case ContentType.TextJavascript:
            return "text/javascript";
        case ContentType.ApplicationJson:
            return "application/json";
        case ContentType.ApplicationLdjson:
            return "application/ld+json";
        case ContentType.AudioMidi:
            return "audio/midi";
        case ContentType.AudioMpeg:
            return "audio/mpeg";
        case ContentType.VideoMp4:
            return "video/mp4";
        case ContentType.VideoMpeg:
            return "video/mpeg";
        case ContentType.ApplicationVndappleinstallerxml:
            return "application/vnd.apple.installer+xml";
        case ContentType.ApplicationVndoasisopendocumentpresentation:
            return "application/vnd.oasis.opendocument.presentation";
        case ContentType.ApplicationVndoasisopendocumentspreadsheet:
            return "application/vnd.oasis.opendocument.spreadsheet";
        case ContentType.ApplicationVndoasisopendocumenttext:
            return "application/vnd.oasis.opendocument.text";
        case ContentType.AudioOgg:
            return "audio/ogg";
        case ContentType.VideoOgg:
            return "video/ogg";
        case ContentType.ApplicationOgg:
            return "application/ogg";
        case ContentType.AudioOpus:
            return "audio/opus";
        case ContentType.FontOtf:
            return "font/otf";
        case ContentType.ImagePng:
            return "image/png";
        case ContentType.ApplicationPdf:
            return "application/pdf";
        case ContentType.ApplicationXhttpdphp:
            return "application/x-httpd-php";
        case ContentType.ApplicationVndmspowerpoint:
            return "application/vnd.ms-powerpoint";
        case ContentType.ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation:
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        case ContentType.ApplicationVndrar:
            return "application/vnd.rar";
        case ContentType.ApplicationRtf:
            return "application/rtf";
        case ContentType.ApplicationXsh:
            return "application/x-sh";
        case ContentType.ImageSvgxml:
            return "image/svg+xml";
        case ContentType.ApplicationXtar:
            return "application/x-tar";
        case ContentType.ImageTiff:
            return "image/tiff";
        case ContentType.VideoMp2t:
            return "video/mp2t";
        case ContentType.FontTtf:
            return "font/ttf";
        case ContentType.TextPlain:
            return "text/plain";
        case ContentType.ApplicationVndvisio:
            return "application/vnd.visio";
        case ContentType.AudioWav:
            return "audio/wav";
        case ContentType.AudioWebm:
            return "audio/webm";
        case ContentType.VideoWebm:
            return "video/webm";
        case ContentType.ImageWebp:
            return "image/webp";
        case ContentType.FontWoff:
            return "font/woff";
        case ContentType.FontWoff2:
            return "font/woff2";
        case ContentType.ApplicationXhtmlxml:
            return "application/xhtml+xml";
        case ContentType.ApplicationVndmsexcel:
            return "application/vnd.ms-excel";
        case ContentType.ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet:
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case ContentType.ApplicationXml:
            return "application/xml";
        case ContentType.ApplicationVndmozillaxulxml:
            return "application/vnd.mozilla.xul+xml";
        case ContentType.ApplicationZip:
            return "application/zip";
        case ContentType.ApplicationX7zcompressed:
            return "application/x-7z-compressed";
        case ContentType.Unknown:
            return "application/octet-stream";
        default : 
            return "application/octet-stream";
    }
}


// 直接返回 ContentType，无法识别时返回 ContentType.Unknown
export function getContentTypeByMimetype(value: string): ContentType {
    switch (value) {
        case "audio/aac":
            return ContentType.AudioAac;
        case "application/x-abiword":
            return ContentType.ApplicationXabiword;
        case "image/apng":
            return ContentType.ImageApng;
        case "application/x-freearc":
            return ContentType.ApplicationXfreearc;
        case "image/avif":
            return ContentType.ImageAvif;
        case "video/x-msvideo":
            return ContentType.VideoXmsvideo;
        case "application/vnd.amazon.ebook":
            return ContentType.ApplicationVndamazonebook;
        case "application/octet-stream":
            return ContentType.ApplicationOctetstream;
        case "image/bmp":
            return ContentType.ImageBmp;
        case "application/x-bzip":
            return ContentType.ApplicationXbzip;
        case "application/x-bzip2":
            return ContentType.ApplicationXbzip2;
        case "application/x-cdf":
            return ContentType.ApplicationXcdf;
        case "application/x-csh":
            return ContentType.ApplicationXcsh;
        case "text/css":
            return ContentType.TextCss;
        case "text/csv":
            return ContentType.TextCsv;
        case "application/msword":
            return ContentType.ApplicationMsword;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return ContentType.ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument;
        case "application/vnd.ms-fontobject":
            return ContentType.ApplicationVndmsfontobject;
        case "application/epub+zip":
            return ContentType.ApplicationEpubzip;
        case "application/gzip":
            return ContentType.ApplicationGzip;
        case "image/gif":
            return ContentType.ImageGif;
        case "text/html":
            return ContentType.TextHtml;
        case "image/vnd.microsoft.icon":
            return ContentType.ImageVndmicrosofticon;
        case "text/calendar":
            return ContentType.TextCalendar;
        case "application/java-archive":
            return ContentType.ApplicationJavaarchive;
        case "image/jpeg":
            return ContentType.ImageJpeg;
        case "text/javascript":
            return ContentType.TextJavascript;
        case "application/json":
            return ContentType.ApplicationJson;
        case "application/ld+json":
            return ContentType.ApplicationLdjson;
        case "audio/midi":
            return ContentType.AudioMidi;
        case "audio/mpeg":
            return ContentType.AudioMpeg;
        case "video/mp4":
            return ContentType.VideoMp4;
        case "video/mpeg":
            return ContentType.VideoMpeg;
        case "application/vnd.apple.installer+xml":
            return ContentType.ApplicationVndappleinstallerxml;
        case "application/vnd.oasis.opendocument.presentation":
            return ContentType.ApplicationVndoasisopendocumentpresentation;
        case "application/vnd.oasis.opendocument.spreadsheet":
            return ContentType.ApplicationVndoasisopendocumentspreadsheet;
        case "application/vnd.oasis.opendocument.text":
            return ContentType.ApplicationVndoasisopendocumenttext;
        case "audio/ogg":
            return ContentType.AudioOgg;
        case "video/ogg":
            return ContentType.VideoOgg;
        case "application/ogg":
            return ContentType.ApplicationOgg;
        case "audio/opus":
            return ContentType.AudioOpus;
        case "font/otf":
            return ContentType.FontOtf;
        case "image/png":
            return ContentType.ImagePng;
        case "application/pdf":
            return ContentType.ApplicationPdf;
        case "application/x-httpd-php":
            return ContentType.ApplicationXhttpdphp;
        case "application/vnd.ms-powerpoint":
            return ContentType.ApplicationVndmspowerpoint;
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return ContentType.ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation;
        case "application/vnd.rar":
            return ContentType.ApplicationVndrar;
        case "application/rtf":
            return ContentType.ApplicationRtf;
        case "application/x-sh":
            return ContentType.ApplicationXsh;
        case "image/svg+xml":
            return ContentType.ImageSvgxml;
        case "application/x-tar":
            return ContentType.ApplicationXtar;
        case "image/tiff":
            return ContentType.ImageTiff;
        case "video/mp2t":
            return ContentType.VideoMp2t;
        case "font/ttf":
            return ContentType.FontTtf;
        case "text/plain":
            return ContentType.TextPlain;
        case "application/vnd.visio":
            return ContentType.ApplicationVndvisio;
        case "audio/wav":
            return ContentType.AudioWav;
        case "audio/webm":
            return ContentType.AudioWebm;
        case "video/webm":
            return ContentType.VideoWebm;
        case "image/webp":
            return ContentType.ImageWebp;
        case "font/woff":
            return ContentType.FontWoff;
        case "font/woff2":
            return ContentType.FontWoff2;
        case "application/xhtml+xml":
            return ContentType.ApplicationXhtmlxml;
        case "application/vnd.ms-excel":
            return ContentType.ApplicationVndmsexcel;
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return ContentType.ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet;
        case "application/xml":
            return ContentType.ApplicationXml;
        case "application/vnd.mozilla.xul+xml":
            return ContentType.ApplicationVndmozillaxulxml;
        case "application/zip":
            return ContentType.ApplicationZip;
        case "application/x-7z-compressed":
            return ContentType.ApplicationX7zcompressed;
        default:
            return ContentType.Unknown; // 无法识别时返回 Unknown
    }
}


function getExtType(file : string){
    let index = file.lastIndexOf(".");
    let suffix = "";
    if(index != -1){
        suffix = file.substring(index + 1);
    }
    return suffix;
}

export function getFileContentType(fileName : string) :ContentType{
    return getContentTypeByExtType(getExtType(fileName));
}



function test_type(fname:string){
    const contentType = getFileContentType(fname);
    const contentString = getMimeTypeByContentType(contentType);
    console.log(fname,contentType,contentString);
}
function test(){
    test_type("a.jpg");
    test_type("c.png");
    test_type("d:/abc.zip");
}

/**
 * 根据文件头识别图片格式并返回扩展名
 * @param buffer - 图片文件的 Buffer 或 Uint8Array
 * @returns 图片扩展名（如 'jpg'），未知格式返回 'bin'
 */
export function detectImageExtension(buffer: Buffer | Uint8Array): string {
    const uint8Array = buffer instanceof Buffer ? new Uint8Array(buffer) : buffer;
    const hexHeader = Array.from(uint8Array.slice(0, 16)) // 检查前16字节
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(' ')
      .toUpperCase();
  
    // 匹配常见图片格式的文件头
    if (hexHeader.startsWith('FF D8 FF')) return 'jpg';
    if (hexHeader.startsWith('89 50 4E 47 0D 0A 1A 0A')) return 'png';
    if (hexHeader.startsWith('47 49 46 38')) return 'gif';
    if (hexHeader.startsWith('52 49 46 46') && hexHeader.includes('57 45 42 50')) return 'webp';
    if (hexHeader.startsWith('42 4D')) return 'bmp';
    if (hexHeader.startsWith('49 49 2A 00') || hexHeader.startsWith('4D 4D 00 2A')) return 'tiff';
    if (hexHeader.startsWith('00 00 01 00')) return 'ico';
    if (hexHeader.includes('66 74 79 70 68 65 69 63')) return 'heic'; // HEIF/HEIC
    if (hexHeader.includes('66 74 79 70 61 76 69 66')) return 'avif';
    
    // 如果是文本格式（如 SVG），检查前几个字符
    const textDecoder = new TextDecoder('utf-8');
    const textHeader = textDecoder.decode(uint8Array.slice(0, 100)); // 检查前100字节文本
    if (textHeader.trim().startsWith('<svg') || textHeader.trim().startsWith('<?xml')) return 'svg';
  
    return 'bin'; // 未知格式
  }


  // 根据 ContentType 获取文件扩展名
export function getExtTypeByContentType(contentType: ContentType): string  {
    switch (contentType) {
        case ContentType.AudioAac:
            return "aac";
        case ContentType.ApplicationXabiword:
            return "abw";
        case ContentType.ImageApng:
            return "apng";
        case ContentType.ApplicationXfreearc:
            return "arc";
        case ContentType.ImageAvif:
            return "avif";
        case ContentType.VideoXmsvideo:
            return "avi";
        case ContentType.ApplicationVndamazonebook:
            return "azw";
        case ContentType.ApplicationOctetstream:
            return "bin";
        case ContentType.ImageBmp:
            return "bmp";
        case ContentType.ApplicationXbzip:
            return "bz";
        case ContentType.ApplicationXbzip2:
            return "bz2";
        case ContentType.ApplicationXcdf:
            return "cda";
        case ContentType.ApplicationXcsh:
            return "csh";
        case ContentType.TextCss:
            return "css";
        case ContentType.TextCsv:
            return "csv";
        case ContentType.ApplicationMsword:
            return "doc";
        case ContentType.ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument:
            return "docx";
        case ContentType.ApplicationVndmsfontobject:
            return "eot";
        case ContentType.ApplicationEpubzip:
            return "epub";
        case ContentType.ApplicationGzip:
            return "gz";
        case ContentType.ImageGif:
            return "gif";
        case ContentType.TextHtml:
            return "html";
        case ContentType.ImageVndmicrosofticon:
            return "ico";
        case ContentType.TextCalendar:
            return "ics";
        case ContentType.ApplicationJavaarchive:
            return "jar";
        case ContentType.ImageJpeg:
            return "jpg";
        case ContentType.TextJavascript:
            return "js";
        case ContentType.ApplicationJson:
            return "json";
        case ContentType.ApplicationLdjson:
            return "jsonld";
        case ContentType.AudioMidi:
            return "mid";
        case ContentType.AudioMpeg:
            return "mp3";
        case ContentType.VideoMp4:
            return "mp4";
        case ContentType.VideoMpeg:
            return "mpeg";
        case ContentType.ApplicationVndappleinstallerxml:
            return "mpkg";
        case ContentType.ApplicationVndoasisopendocumentpresentation:
            return "odp";
        case ContentType.ApplicationVndoasisopendocumentspreadsheet:
            return "ods";
        case ContentType.ApplicationVndoasisopendocumenttext:
            return "odt";
        case ContentType.AudioOgg:
            return "oga";
        case ContentType.VideoOgg:
            return "ogg";
        case ContentType.ApplicationOgg:
            return "ogx";
        case ContentType.AudioOpus:
            return "opus";
        case ContentType.FontOtf:
            return "otf";
        case ContentType.ImagePng:
            return "png";
        case ContentType.ApplicationPdf:
            return "pdf";
        case ContentType.ApplicationXhttpdphp:
            return "php";
        case ContentType.ApplicationVndmspowerpoint:
            return "ppt";
        case ContentType.ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation:
            return "pptx";
        case ContentType.ApplicationVndrar:
            return "rar";
        case ContentType.ApplicationRtf:
            return "rtf";
        case ContentType.ApplicationXsh:
            return "sh";
        case ContentType.ImageSvgxml:
            return "svg";
        case ContentType.ApplicationXtar:
            return "tar";
        case ContentType.ImageTiff:
            return "tiff";
        case ContentType.VideoMp2t:
            return "ts";
        case ContentType.FontTtf:
            return "ttf";
        case ContentType.TextPlain:
            return "txt";
        case ContentType.ApplicationVndvisio:
            return "vsd";
        case ContentType.AudioWav:
            return "wav";
        case ContentType.AudioWebm:
            return "weba";
        case ContentType.VideoWebm:
            return "webm";
        case ContentType.ImageWebp:
            return "webp";
        case ContentType.FontWoff:
            return "woff";
        case ContentType.FontWoff2:
            return "woff2";
        case ContentType.ApplicationXhtmlxml:
            return "xhtml";
        case ContentType.ApplicationVndmsexcel:
            return "xls";
        case ContentType.ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet:
            return "xlsx";
        case ContentType.ApplicationXml:
            return "xml";
        case ContentType.ApplicationVndmozillaxulxml:
            return "xul";
        case ContentType.ApplicationZip:
            return "zip";
        case ContentType.ApplicationX7zcompressed:
            return "7z";
        default:
            return "bin";
    }
}



//test();
/**
 * unknown contenttype
 * HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="unknown.bin"
 */


/**
 * MIME 类型到文件扩展名的映射表
 */
const mimeTypeToExtensionMap: Record<string, string> = {
    // 图像类型
'image/jpeg' : 'jpg',
'image/png' : 'png',
'image/gif' : 'gif',
'image/bmp' : 'bmp',
'image/webp' : 'webp',
'image/svg+xml' : 'svg',
'image/tiff' : 'tiff',
'image/x-icon' : 'ico',
'video/mp4' : 'mp4',
'video/mpeg' : 'mpeg',
'video/webm' : 'webm',
'video/quicktime' : 'mov',
'video/x-ms-wmv' : 'wmv',
'video/x-flv' : 'flv',
'audio/mpeg' : 'mp3',
'audio/wav' : 'wav',
'audio/wave' : 'wav',
'audio/ogg' : 'ogg',
'audio/flac' : 'flac',
'audio/x-m4a' : 'm4a',
'audio/webm' : 'webm',
'application/pdf' : 'pdf',
'application/msword' : 'doc',
'application/vnd.ms-excel' : 'xls',
'application/vnd.ms-powerpoint' : 'ppt',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'docx{"name":"DoubaoPlugin","parameters":{"input":"&quot;docx{&quot;name&quot;:&quot;DoubaoPlugin&quot;,&quot;parameters&quot;:{&quot;input&quot;:&quot;name&quot;}}<|FunctionExecuteEnd|><|FunctionExecuteResult|>name<|FunctionExecuteResultEnd|>docx.docx"}}<|FunctionExecuteEnd|>.docx',
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'xlsx',
'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'pptx',
'text/plain' : 'txt',
'text/csv' : 'csv',
'text/html' : 'html',
'text/css' : 'css',
'text/javascript' : 'js',
'application/json' : 'json',
'application/xml' : 'xml',
'application/zip' : 'zip',
'application/x-rar-compressed' : 'rar',
'application/x-tar' : 'tar',
'application/gzip' : 'gz',
'application/x-7z-compressed' : '7z',
'font/ttf' : 'ttf',
'font/otf' : 'otf',
'font/woff' : 'woff',
'font/woff2' : 'woff2',
'application/octet-stream' : 'bin',
'application/x-sh' : 'sh',
'application/x-msdownload' : 'exe',
'application/x-java-applet' : 'class',
  };
  
  /**
   * 根据 MIME 类型获取对应的文件扩展名
   * @param mimeType - MIME 类型字符串，如 "image/jpeg"
   * @returns 对应的文件扩展名（不带点），如果未找到则返回 undefined
   */
  export function getExtensionFromMimeType(mimeType: string): string  {
    return mimeTypeToExtensionMap[mimeType.toLowerCase()] || 'bin';
  }
  
  /**
   * 获取文件扩展名的安全版本，如果未找到匹配的扩展名，返回一个默认值
   * @param mimeType - MIME 类型字符串
   * @param defaultValue - 未找到匹配时的默认扩展名（不带点），默认为 "bin"
   * @returns 对应的文件扩展名（不带点）
   */
  export function getExtensionFromMimeTypeSafe(mimeType: string, defaultValue: string = 'bin'): string {
    return getExtensionFromMimeType(mimeType) || defaultValue;
  }
  
  /**
   * 根据文件扩展名获取对应的 MIME 类型（反向映射，可能存在多个扩展名对应同一个 MIME 类型，此函数返回第一个匹配）
   * @param extension - 文件扩展名（带点或不带点均可，如 ".jpg" 或 "jpg"）
   * @returns 对应的 MIME 类型，如果未找到则返回 undefined
   */
  export function getMimeTypeFromExtension(extension: string): string | undefined {
    const cleanExt = extension.replace(/^\./, '').toLowerCase();
    return Object.keys(mimeTypeToExtensionMap).find(
      mimeType => mimeTypeToExtensionMap[mimeType] === cleanExt
    );
  }    

  function testMime(){
     for(let k in mimeTypeToExtensionMap){
        console.log(`'${k}' : '${mimeTypeToExtensionMap[k]}',`);
     }
  }

