declare module '@ckeditor/ckeditor5-react' {
  import { EventInfo } from '@ckeditor/ckeditor5-utils';
  import { Editor } from '@ckeditor/ckeditor5-core';

  export interface CKEditorProps {
    editor: any;
    data?: string;
    config?: any;
    onChange?: (event: EventInfo, editor: Editor) => void;
    onReady?: (editor: Editor) => void;
    onBlur?: (event: EventInfo, editor: Editor) => void;
    onFocus?: (event: EventInfo, editor: Editor) => void;
    onError?: (event: EventInfo, editor: Editor) => void;
  }

  export const CKEditor: React.FC<CKEditorProps>;
} 