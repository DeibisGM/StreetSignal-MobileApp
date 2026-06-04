import React from 'react';
import renderer from 'react-test-renderer';
import {ErrorMessage} from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders nothing when message is null', () => {
    const tree = renderer.create(<ErrorMessage message={null} />).toJSON();
    expect(tree).toBeNull();
  });

  it('renders error text', () => {
    const tree = renderer
      .create(<ErrorMessage message="Credenciales incorrectas" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
