import { 
  FileTextIcon, 
  ImageIcon, 
  FileIcon, 
  FileSpreadsheetIcon,
  PresentationIcon,
  FileVideoIcon,
  FileAudioIcon,
  ArchiveIcon,
} from 'lucide-react';

export function getFileTypeIcon(fileName: string) {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return FileTextIcon;
    case 'doc':
    case 'docx':
      return FileTextIcon;
    case 'txt':
      return FileTextIcon;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return ImageIcon;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return FileSpreadsheetIcon;
    case 'ppt':
    case 'pptx':
      return PresentationIcon;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
      return FileVideoIcon;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return FileAudioIcon;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return ArchiveIcon;
    default:
      return FileIcon;
  }
}

export function getFileTypeColor(fileName: string) {
  // Return the same blue color used for folders to maintain consistency
  return { bg: 'bg-blue-50', text: 'text-blue-600' };
}
