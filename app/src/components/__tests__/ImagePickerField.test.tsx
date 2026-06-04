import React from 'react';
import renderer from 'react-test-renderer';
import {ImagePickerField} from '../ImagePickerField';

describe('ImagePickerField', () => {
  it('renders empty state', () => {
    const tree = renderer
      .create(<ImagePickerField onPick={() => {}} label="Foto" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with selected image', () => {
    const tree = renderer
      .create(
        <ImagePickerField
          value="file:///tmp/photo.jpg"
          onPick={() => {}}
          onRemove={() => {}}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const tree = renderer
      .create(<ImagePickerField onPick={() => {}} disabled />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
