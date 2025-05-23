import * as React from 'react';
import { Cross2Icon, FileTextIcon, UploadIcon } from '@radix-ui/react-icons';
import Dropzone, { type DropzoneProps, type FileRejection } from 'react-dropzone';
import { Label } from './label';
import { cn, formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useControllableState } from '@/hooks/use-controllable-state';
import { toast } from 'sonner';
import {
  Download,
  FilePen,
  FileSpreadsheet,
  FileVideo,
  ImageIcon,
  PackageOpen,
  Paperclip
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps['accept'];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps['maxSize'];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps['maxFiles'];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept,
    maxSize = 1024 * 1024 * 50,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const { t: tCommon } = useTranslation('common');

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Filter out empty files
      const emptyFiles = acceptedFiles.filter((file) => file.size === 0);
      if (emptyFiles.length > 0) {
        emptyFiles.forEach((file) => {
          toast.warning(tCommon('files.rejected_empty_file_warning', { name: file.name }));
        });
      }
  
      // Filter non-empty files
      const validFiles = acceptedFiles.filter((file) => file.size > 0);
  
      if (!multiple && maxFileCount === 1 && validFiles.length > 1) {
        toast.error(tCommon('files.max_one_per_upload_warning'));
        return;
      }
  
      if ((files?.length ?? 0) + validFiles.length > maxFileCount) {
        toast.error(tCommon('files.max_file_warning', { count: maxFileCount }));
        return;
      }
  
      const newFiles = validFiles.map((file) => {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
        return fileWithPreview;
      });
  
      const updatedFiles = files ? [...files, ...newFiles] : newFiles;
  
      setFiles(updatedFiles);

      // Handle already rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(tCommon('files.file_rejected', { name: file.name }));
        });
      }

      // Handle upload if necessary
      if (onUpload && updatedFiles.length > 0 && updatedFiles.length <= maxFileCount) {
        const target =
          updatedFiles.length > 0
            ? `${updatedFiles.length} ${tCommon('files.plural')}`
            : `${tCommon('files.singular')}`;

        //@ts-ignore
        toast.warn(onUpload(updatedFiles), {
          loading: `${tCommon('files.uploading')} ${target}...`,
          success: () => {
            setFiles([]);
            return `${target} ${tCommon('files.uploaded')}`;
          },
          error: tCommon('files.failed_to_upload', { target })
        });
      }
    },
    [files, maxFileCount, multiple, onUpload, setFiles]  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  return (
    <div className="relative flex justify-center items-center gap-2 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'group relative grid h-52 w-2/3 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isDragActive && 'border-muted-foreground/50',
              isDisabled && 'pointer-events-none opacity-60',
              className
            )}
            {...dropzoneProps}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="font-medium text-muted-foreground">Drop the files here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">
                    {tCommon('files.drag_files_sentance')}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {maxFileCount > 1
                      ? //@ts-ignore
                        tCommon('files.multiple_files_max_size_sentence', {
                          size: formatBytes(maxSize),

                          count: maxFileCount === Infinity ? 'multiple' : maxFileCount
                        })
                      : tCommon('files.single_file_max_size_sentence', {
                          size: formatBytes(maxSize)
                        })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {files?.length ? (
        <ScrollArea className="w-1/3 px-2 py-2  rounded cursor-pointer">
          <div className="flex max-h-48 flex-col gap-4">
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => {
                  onRemove(index);
                }}
                progress={progresses?.[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Label className="text-base font-bold w-1/3 flex justify-center gap-2">
          {tCommon('files.no_selected_file')} <PackageOpen />
        </Label>
      )}
    </div>
  );
}

interface FileCardProps {
  key: number;
  file: FileWithPreview;
  onRemove: () => void;
  progress?: number;
}

interface FilePreviewProps {
  file: FileWithPreview;
}
interface FileWithPreview extends File {
  preview?: string;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  // Add null check
  if (!file) return null;

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  // Trigger download when clicking on the file
  const handleFileDownload = () => {
    const url = file.preview || URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (!file.preview) {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="relative flex items-center gap-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 p-1 rounded-lg">
      <div className="flex flex-1 gap-2.5">
        <FilePreview file={file} />
        <div className="flex w-full flex-col gap-2 ">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2 ">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={handleFileDownload}>
          <Download className="size-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="size-7" onClick={onRemove}>
          <Cross2Icon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}



function FilePreview({ file }: FilePreviewProps) {
  const ext = file?.name?.split('.').pop()?.trim().toLowerCase() || '';
  if (file.type.startsWith('image/')) {
    return <ImageIcon className="w-10 h-10" />;
  }
  if (file.name.endsWith('pdf')) {
    return <Paperclip className="w-10 h-10" />;
  }
  if (['xlsx', 'xls', 'ods'].includes(ext)) {
    return <FileSpreadsheet className="w-10 h-10" />;
  }
  if (['docx', 'doc'].includes(ext)) {
    return <FilePen className="w-10 h-10" />;
  }
  if (['ppt', 'pptx', 'mp4', 'avi', 'mkv', 'flv', 'mov', 'amv'].includes(ext)) {
    return <FileVideo className="w-10 h-10" />;
  }

  return <FileTextIcon className="size-10 text-muted-foreground" aria-hidden="true" />;
}
