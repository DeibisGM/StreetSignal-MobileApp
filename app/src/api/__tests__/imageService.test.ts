import {pickFromGallery} from '../imageService';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

const imagePicker = jest.requireMock('react-native-image-picker') as {
  launchImageLibrary: jest.Mock;
};

describe('imageService.pickFromGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no assets are available', async () => {
    imagePicker.launchImageLibrary.mockResolvedValueOnce({assets: undefined});

    await expect(pickFromGallery()).resolves.toBeNull();
  });
});
