
/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

// Angular and system imports.
import { Injectable } from '@angular/core';
import { Count } from 'src/app/models/count.model';

// Application specific imports.
import { HttpService } from 'src/app/_general/services/http.service';
import { CacheItem } from 'src/app/_protected/models/common/cache-item.model';

/**
 * Cache service allowing the user to modify his or her cache, viewing items, removing
 * items, and purging cache altogether.
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {

  /**
   * Creates an instance of your service.
   *
   * @param httpService HTTP service to use for backend invocations
   */
  constructor(private httpService: HttpService) { }

  /**
   * Returns all cache items from backend matching optional filter.
   *
   * @param filter Optional query filter deciding which items to return
   */
  public list(filter: any = null) {
    let query = '';
    if (filter !== null) {
      query += '?limit=' + filter.limit;
      query += "&offset=" + filter.offset;
      if (filter.filter && filter.filter !== '') {
        query += '&filter=' + encodeURIComponent(filter.filter);
      }
    }
    return this.httpService.get<CacheItem[]>('/magic/system/cache/list' + query);
  }

  /**
   * Returns count of all cache items from backend matching optional filter.
   *
   * @param filter Optional query filter deciding which items to include when counting
   */
  public count(filter: string = null) {
    let query = '';
    if (filter !== null && filter !== '') {
      query += '?filter=' + encodeURIComponent(filter);
    }
    return this.httpService.get<Count>('/magic/system/cache/count' + query);
  }

  /**
   * Deletes a single cache item.
   *
   * @param id ID of item to delete
   */
  public delete(id: string) {
    return this.httpService.delete<Response>('/magic/system/cache/delete?id=' + encodeURIComponent(id));
  }

  /**
   * Deletes all cache items matching the optional filter condition.
   *
   * @param filter Optional query filter deciding which items to include when deleting items
   */
  public clear(filter: string = null) {
    let query = '';
    if (filter !== null && filter !== '') {
      query += '?filter=' + encodeURIComponent(filter);
    }
    return this.httpService.delete<Response>('/magic/system/cache/empty' + query);
  }
}
