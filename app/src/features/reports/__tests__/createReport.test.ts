import {reportsService} from '../../../api/reportsService';
import {apiClient} from '../../../api/client';

jest.mock('../../../api/client');

const mockedPostForm = apiClient.postForm as jest.Mock;

const REPORT_RESPONSE = {
  id: 'report-1',
  title: 'Bache en la acera',
  description: 'Hay un bache grande en la acera principal',
  categoryId: 'cat-guid-2',
  category: 'Infraestructura',
  status: 'Pending',
  latitude: 9.9281,
  longitude: -84.0907,
  address: 'San José, CR',
  createdById: 'user-1',
  createdByName: 'Ciudadano Test',
  createdAt: '2025-01-01T00:00:00Z',
};

describe('reportsService.createReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls postForm /reports and appends the expected text fields', async () => {
    mockedPostForm.mockResolvedValueOnce(REPORT_RESPONSE);

    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: 9.9281,
      longitude: -84.0907,
      address: 'San José, CR',
      images: [
        {uri: 'file://photo.jpg', name: 'photo.jpg', type: 'image/jpeg'},
      ],
    });

    expect(mockedPostForm).toHaveBeenCalledTimes(1);
    expect(mockedPostForm.mock.calls[0][0]).toBe('/reports');

    expect(appendSpy).toHaveBeenCalledWith('title', 'Bache en la acera');
    expect(appendSpy).toHaveBeenCalledWith(
      'description',
      'Hay un bache grande en la acera principal',
    );
    expect(appendSpy).toHaveBeenCalledWith('categoryId', 'cat-guid-2');
    expect(appendSpy).toHaveBeenCalledWith('latitude', '9.9281');
    expect(appendSpy).toHaveBeenCalledWith('longitude', '-84.0907');
    expect(appendSpy).toHaveBeenCalledWith('address', 'San José, CR');

    appendSpy.mockRestore();
  });

  it('omits address field when not provided', async () => {
    mockedPostForm.mockResolvedValueOnce(REPORT_RESPONSE);

    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: 9.9281,
      longitude: -84.0907,
    });

    const appendedKeys = appendSpy.mock.calls.map(([key]) => key);
    expect(appendedKeys).not.toContain('address');

    appendSpy.mockRestore();
  });

  it('sends a multipart/form-data request (postForm, not post)', async () => {
    mockedPostForm.mockResolvedValueOnce(REPORT_RESPONSE);

    await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: 9.9281,
      longitude: -84.0907,
    });

    expect(mockedPostForm).toHaveBeenCalledTimes(1);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('propagates API errors to the caller', async () => {
    const apiError = new Error('HTTP 400 Bad Request');
    mockedPostForm.mockRejectedValueOnce(apiError);

    await expect(
      reportsService.createReport({
        title: 'Bache en la acera',
        description: 'Hay un bache grande en la acera principal',
        categoryId: 'cat-guid-2',
        latitude: 9.9281,
        longitude: -84.0907,
      }),
    ).rejects.toThrow('HTTP 400 Bad Request');
  });

  it('returns the created report on success', async () => {
    mockedPostForm.mockResolvedValueOnce(REPORT_RESPONSE);

    const result = await reportsService.createReport({
      title: 'Bache en la acera',
      description: 'Hay un bache grande en la acera principal',
      categoryId: 'cat-guid-2',
      latitude: 9.9281,
      longitude: -84.0907,
    });

    expect(result.id).toBe('report-1');
    expect(result.status).toBe('Pending');
  });
});
