import React,{useState, useMemo, useCallback} from "react";
import { createEditor, Transforms,Editor, Text } from 'slate';
import { Slate,Editable,withReact, useSlateStatic } from "slate-react";
import imageExtensions from 'image-extensions'
import { withHistory } from 'slate-history'
import isUrl from 'is-url'


const ImageEditorz = () => {

    //const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), [])
    //const editor = useState(() => withReact(createEditor()),[]);
    const [editor] = useState(() => withReact(withHistory(createEditor())))
    
    return (
        <Slate
            editor = {editor}
            value = {initialValue}>
            <div>
                <InsertImageButton />
            </div>
            <Editable 
             renderElement={props => <Element {...props} />}
             placeholder="Enter some text..."
            />
        </Slate>
    );
};

const withImages = editor => {
  const { insertData, isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }
  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertImage = (editor, url) => {
  const text = { text: '' }
  const  ImageElement = { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
}

const Element = props => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'image':
      return <Image {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)

  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
        `}
      >
        <img
          src={element.url}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            display: ${selected && focused ? 'inline' : 'none'};
            position: absolute;
            top: 0.5em;
            left: 0.5em;
            background-color: white;
          `}
        >
          <Icon>delete</Icon>
        </Button>
      </div>
    </div>
  )
}

const InsertImageButton = () => {
  const editor = useSlateStatic()
  return (
      <Button 
        onMouseDown={event => {
            event.preventDefault()
            const url = window.prompt('Enter the URL of the image:')
            if (url && !isImageUrl(url)) {
            alert('URL is not an image')
            return
            }
            insertImage(editor, url)
        }}>
        <Icon>image</Icon>
      </Button>
    
  )
}

const isImageUrl = url => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}

const initialValue = [
    {
        type: 'paragraph',
        children:[{text:"This is a Text Area that can be edited"}],
    },
];

//This function defines a react component render for our code block.

const CodeElement = props => {
    return (
        <pre {...props.attributes}>
            <code>{props.children}</code>
        </pre>
    )
}
const DefaultElement = props => {
    return <p {...props.attributes}>{props.children}</p>
}

const Leaf = props => {
    return (
        <span 
            {...props.attributes}
            style = {{ fontWeight: props.leaf.bold ? 'bold': 'normal' }}>
        {props.children}
        </span>
    )
}
export default ImageEditorz;