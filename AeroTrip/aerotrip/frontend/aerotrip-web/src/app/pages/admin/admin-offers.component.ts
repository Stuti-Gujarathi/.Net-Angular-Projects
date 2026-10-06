import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage } from '../../core/interceptors/error.interceptor';
import { CABIN_LABELS, CabinClass, DiscountType, Offer, UpsertOffer } from '../../core/models/models';
import { AdminService } from '../../core/services/admin.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ToastService } from '../../core/services/toast.service';
import { DrawerComponent, ModalComponent } from '../../shared/components/drawer/drawer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InrPipe } from '../../shared/pipes/format.pipes';

const THEMES = ['amber', 'ocean', 'plum', 'forest', 'rose'];

@Component({
  selector: 'at-admin-offers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe, IconComponent, InrPipe, DrawerComponent, ModalComponent],
  templateUrl: './admin-offers.component.html',
  styleUrls: ['./admin-shared.scss', './admin-offers.component.scss'],
})
export class AdminOffersComponent {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  protected readonly airlines = toSignal(inject(CatalogService).airlines$, { initialValue: [] });

  protected readonly cabinLabels = CABIN_LABELS;
  protected readonly cabins: CabinClass[] = ['Economy', 'PremiumEconomy', 'Business'];
  protected readonly themes = THEMES;
  protected readonly offers = signal<Offer[] | null>(null);
  protected readonly editing = signal<Offer | null>(null);
  protected readonly drawerOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly deleting = signal<Offer | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4,16}$/)]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    discountType: ['Percentage' as DiscountType],
    value: [10, [Validators.required, Validators.min(1)]],
    maxDiscount: [1000, Validators.min(0)],
    minBookingAmount: [3000, Validators.min(0)],
    validFrom: [today(0), Validators.required],
    validTo: [today(30), Validators.required],
    cabin: this.fb.control<CabinClass | ''>(''),
    airlineCode: [''],
    internationalOnly: [false],
    usageLimit: [1000, [Validators.required, Validators.min(1)]],
    isActive: [true],
    theme: ['ocean'],
  });

  constructor() {
    this.admin.offers().subscribe((o) => this.offers.set(o));
  }

  status(o: Offer): { label: string; cls: string } {
    const now = new Date();
    if (!o.isActive) return { label: 'Paused', cls: 'badge-Expired' };
    if (new Date(o.validTo) < now) return { label: 'Expired', cls: 'badge-danger' };
    if (o.usedCount >= o.usageLimit) return { label: 'Fully used', cls: 'badge-warn' };
    if (new Date(o.validFrom) > now) return { label: 'Scheduled', cls: 'badge-info' };
    return { label: 'Live', cls: 'badge-success' };
  }

  headline(o: Offer): string {
    return o.discountType === 'Flat' ? `₹${o.value.toLocaleString('en-IN')}` : `${o.value}%`;
  }

  rules(o: Offer): string {
    const parts: string[] = [];
    if (o.cabin) parts.push(CABIN_LABELS[o.cabin] + ' only');
    if (o.airlineCode) parts.push(this.airlines().find((a) => a.code === o.airlineCode)?.name + ' only');
    if (o.internationalOnly) parts.push('International only');
    if (o.discountType === 'Percentage' && o.maxDiscount) parts.push(`Up to ₹${o.maxDiscount.toLocaleString('en-IN')}`);
    return parts.join(', ') || 'All flights';
  }

  openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.form.reset({ validFrom: today(0), validTo: today(30) });
    this.drawerOpen.set(true);
  }

  openEdit(o: Offer): void {
    this.editing.set(o);
    this.formError.set(null);
    this.form.reset({
      code: o.code, title: o.title, description: o.description, discountType: o.discountType, value: o.value, maxDiscount: o.maxDiscount,
      minBookingAmount: o.minBookingAmount, validFrom: o.validFrom.slice(0, 10), validTo: o.validTo.slice(0, 10), cabin: o.cabin ?? '',
      airlineCode: o.airlineCode ?? '', internationalOnly: o.internationalOnly, usageLimit: o.usageLimit, isActive: o.isActive, theme: o.theme,
    });
    this.drawerOpen.set(true);
  }

  toggle(o: Offer): void {
    this.admin.setOfferActive(o.id, !o.isActive).subscribe((u) => {
      this.replace(u);
      this.toast.success(`${u.code} ${u.isActive ? 'is live' : 'is paused'}.`);
    });
  }

  confirmDelete(): void {
    const o = this.deleting();
    if (!o) return;
    this.admin.deleteOffer(o.id).subscribe(() => {
      this.offers.update((list) => (list ?? []).filter((x) => x.id !== o.id));
      this.deleting.set(null);
      this.toast.success(`${o.code} deleted.`);
    });
  }

  save(): void {
    this.form.controls.code.setValue(this.form.controls.code.value.toUpperCase());
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const body: UpsertOffer = {
      ...v,
      validFrom: v.validFrom + 'T00:00:00',
      validTo: v.validTo + 'T23:59:59',
      cabin: v.cabin || null,
      airlineCode: v.airlineCode || null,
      maxDiscount: v.discountType === 'Flat' ? v.value : v.maxDiscount,
    };
    this.saving.set(true);
    this.formError.set(null);
    const editing = this.editing();
    (editing ? this.admin.updateOffer(editing.id, body) : this.admin.createOffer(body)).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.drawerOpen.set(false);
        if (editing) this.replace(saved);
        else this.offers.update((list) => [saved, ...(list ?? [])]);
        this.toast.success(editing ? `${saved.code} updated.` : `${saved.code} created. Travellers can use it right away.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(apiErrorMessage(err));
      },
    });
  }

  private replace(o: Offer): void {
    this.offers.update((list) => (list ?? []).map((x) => (x.id === o.id ? o : x)));
  }
}

function today(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
