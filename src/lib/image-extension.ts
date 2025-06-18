import { ReactComponentExtension } from '@remirror/extension-react-component';
import { ImageExtension } from 'remirror/extensions';
import { CustomImageComponent } from '@/components/remirror-extensions/CustomImageComponent';

export const imageExtension = () =>
  new ImageExtension();

export const reactComponentExtension = () =>
  new ReactComponentExtension({
    nodeViewComponents: {
      image: CustomImageComponent,
    },
  });
