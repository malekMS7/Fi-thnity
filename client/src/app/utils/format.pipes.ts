import { Pipe, type PipeTransform } from '@angular/core';
import { formatDate, formatPrice } from './format';

/** {{ ride.date | formatDate }} → « mer. 19 nov. » */
@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  transform(iso: string): string {
    return formatDate(iso);
  }
}

/** {{ ride.price | formatPrice }} → « 18 DT » */
@Pipe({ name: 'formatPrice' })
export class FormatPricePipe implements PipeTransform {
  transform(price: number): string {
    return formatPrice(price);
  }
}
