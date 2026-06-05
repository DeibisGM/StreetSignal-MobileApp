import React from 'react';
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';
import {ImagePickerField} from '../ImagePickerField';

describe('ImagePickerField', () => {
  it('renders empty state', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<ImagePickerField onPick={() => {}} label="Foto" />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders with selected image', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(
          <ImagePickerField
            value="file:///tmp/photo.jpg"
            onPick={() => {}}
            onRemove={() => {}}
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    let tree;
    act(() => {
      tree = renderer
        .create(<ImagePickerField onPick={() => {}} disabled />)
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
