import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Editor } from '@tinymce/tinymce-react';
import 'suneditor/dist/css/suneditor.min.css';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import { getToken } from '../modules/auth/core/_requests';
import { KTIcon } from '../../_metronic/helpers';
import "@fontsource/lalezar";
import '../../assets/css/custom-buttons.css';

// Custom upload adapter
class CustomUploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload() {
    try {
      const file = await this.loader.file;
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(getApiUrl('/api/File/Upload'), formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      return {
        default: response.data.url
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  abort() {
    // Abort upload process
  }
}

function CustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new CustomUploadAdapter(loader);
  };
}

interface DynamicPage {
  id?: number;
  title: string;
  slug: string;
  content: string;
  tags: string;
  isPublished: boolean;
}

interface MenuItem {
  id: number;
  title: string;
  url: string;
  icon: string;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
}

// Basic debounce function with type annotations
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

const DynamicPageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<DynamicPage>({
    title: '',
    slug: '',
    content: '',
    tags: '',
    isPublished: false
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const editorRef = useRef<any>(null);

  // Debounce the state update function
  const debouncedSetPageContent = useCallback(
    debounce((content: string) => {
      setPage(prev => ({
        ...prev,
        content
      }));
    }, 0), // 300ms debounce delay
    [setPage]
  );

  useEffect(() => {
    if (id) {
      fetchPageData();
    }
    fetchMenuItems();
  }, [id]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/MenuItem/GetAll'), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchPageData = async () => {
    try {
      const response = await axios.get(getApiUrl(`/api/DynamicPage/Get/${id}`), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      setPage({
        id: response.data.id,
        title: response.data.title,
        slug: response.data.urlSlug,
        content: response.data.content,
        tags: response.data.tags,
        isPublished: response.data.isPublished
      });
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };

  const handleEditorChange = (content: string) => {
    // Call the debounced state update function
    debouncedSetPageContent(content);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPage(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setPage(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pageData = {
        title: page.title,
        slug: page.slug,
        content: page.content,
        tags: page.tags,
        isPublished: page.isPublished
      };

      if (id) {
        // Update existing page
        await axios.put(getApiUrl(`/api/DynamicPage/Update/${id}`), pageData, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        // Create new page
        await axios.post(getApiUrl('/api/DynamicPage/Create'), pageData, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        });
      }
      
      // Navigate back to the pages list
      navigate('/dynamic-pages');
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header border-0 pt-6 bg-secondary">
        <div className="card-title d-flex justify-content-center w-100">
          <h2 className="fw-bold" style={{ fontFamily: 'Lalezar' }}>ویرایشگر صفحه پویا</h2>
        </div>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-5">
            <div className="col-md-6">
              <div className="fv-row mb-8">
                <label className="form-label fw-bold fs-6 mb-2 text-end d-block" style={{ fontFamily: 'Lalezar' }}>نامک</label>
                <select
                  name="slug"
                  value={page.slug}
                  onChange={handleInputChange}
                  className="form-select form-select-solid text-end"
                  required
                  dir="rtl"
                  style={{ fontFamily: 'Lalezar' }}
                >
                  <option value="">انتخاب کنید</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.url}>
                      {item.title} - {item.url}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="fv-row mb-8">
                <label className="form-label fw-bold fs-6 mb-2 text-end d-block" style={{ fontFamily: 'Lalezar' }}>عنوان</label>
                <input
                  type="text"
                  name="title"
                  value={page.title}
                  onChange={handleInputChange}
                  className="form-control form-control-solid text-end"
                  required
                  dir="rtl"
                  style={{ fontFamily: 'Lalezar' }}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="fv-row mb-8">
                <div className="form-check form-switch form-check-custom form-check-solid d-flex justify-content-end">
                  <label className="form-check-label fw-bold fs-6 ms-2" style={{ fontFamily: 'Lalezar' }}>منتشر شده</label>
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={page.isPublished}
                    onChange={handleInputChange}
                    className="form-check-input"
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="fv-row mb-8">
                <label className="form-label fw-bold fs-6 mb-2 text-end d-block" style={{ fontFamily: 'Lalezar' }}>برچسب‌ها</label>
                <input
                  type="text"
                  name="tags"
                  value={page.tags}
                  onChange={handleInputChange}
                  className="form-control form-control-solid text-end"
                  dir="rtl"
                  placeholder="برچسب‌ها را با کاما جدا کنید"
                  style={{ fontFamily: 'Lalezar' }}
                />
              </div>
            </div>
          </div>

          <div className="fv-row mb-8">
            <label className="form-label fw-bold fs-6 mb-2 text-end d-block" style={{ fontFamily: 'Lalezar' }}>محتوا</label>
            <div className="border rounded">
              <Editor
                tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                onInit={(evt: any, editor: any) => {
                  editorRef.current = editor;
                  if (page.content) {
                    editor.setContent(page.content);
                  }
                }}
                value={page.content}
                init={{
                  height: 500,
                  menubar: true,
                  branding: false,
                  promotion: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'codesample', 'help', 'wordcount', 'directionality'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | image code codesample | help | ltr rtl',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  setup: (editor) => {
                    editor.on('init', () => {
                      editor.on('SetContent', (e) => {
                        const content = editor.getContent();
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = content;
                        
                        const links = tempDiv.getElementsByTagName('a');
                        for (let i = 0; i < links.length; i++) {
                          if (!links[i].getAttribute('target')) {
                            links[i].setAttribute('target', '_blank');
                          }
                        }
                        
                        if (tempDiv.innerHTML !== content) {
                          editor.setContent(tempDiv.innerHTML);
                        }
                      });
                    });
                  },
                  images_upload_handler: async (blobInfo, progress) => {
                    return new Promise((resolve, reject) => {
                      const formData = new FormData();
                      formData.append('file', blobInfo.blob(), blobInfo.filename());

                      axios.post(getApiUrl('/api/File/Upload'), formData, {
                        headers: {
                          Authorization: `Bearer ${getToken()}`,
                          'Content-Type': 'multipart/form-data',
                        },
                        withCredentials: true,
                        onUploadProgress: (event) => {
                          if (event.lengthComputable) {
                            const percentComplete = (event.loaded / event.total!) * 100;
                            progress(percentComplete);
                          }
                        }
                      })
                      .then(response => {
                        resolve(response.data.url);
                      })
                      .catch(error => {
                        console.error('Error uploading image:', error);
                        reject('Image upload failed');
                      });
                    });
                  },
                  file_picker_types: 'image',
                  file_picker_callback: (cb, value, meta) => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');

                    input.addEventListener('change', (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                          // Need to use the TinyMCE upload mechanism for the actual upload
                          // The file_picker_callback is just to select the file
                          // The images_upload_handler will take care of the upload once the file is selected
                          // We don't need to manually create blobInfo here as images_upload_handler gets it directly.
                          // Just trigger the upload process by simulating a paste or drag-drop event with the selected file.
                          // A simpler approach for file_picker_callback is just to let the user select the file
                          // and let images_upload_handler handle the rest when the image is inserted.
                          // However, to fully replicate the App.tsx logic, we need to use blobCache.
                          const id = 'blobid' + (new Date()).getTime();
                          const blobCache = editorRef.current.editorUpload.blobCache;
                          const base64 = (reader.result as string).split(',')[1];
                          const blobInfo = blobCache.create(id, file, base64);
                          blobCache.add(blobInfo);
                          cb(blobInfo.blobUri(), { title: file.name });
                        });
                        reader.readAsDataURL(file);
                      }
                    });

                    input.click();
                  },
                  directionality: 'rtl'
                }}
                onEditorChange={handleEditorChange}
              />
            </div>
          </div>

          <div 
            className="position-fixed"
            style={{ 
              left: '2rem', 
              bottom: '6rem', 
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <button
              type="button"
              className="material-fab primary"
              onClick={() => navigate('/dynamic-pages')}
            >
              <div className="btn-content">
                <div className="icon-wrapper">
                  <KTIcon iconName="arrow-right" className="fs-2" />
                </div>
                <span className="btn-text">
                  بازگشت
                </span>
              </div>
              <div className="ripple"></div>
            </button>

            <button
              type="submit"
              className="material-fab success"
              onClick={handleSubmit}
            >
              <div className="btn-content">
                <div className="icon-wrapper">
                  <KTIcon iconName={id ? "check" : "plus"} className="fs-2" />
                </div>
                <span className="btn-text">
                  ذخیره صفحه
                </span>
              </div>
              <div className="ripple"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicPageEditor; 