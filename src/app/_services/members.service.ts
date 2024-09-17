import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { AccountService } from './account.service';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';


@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  baseurl = environment.apiurl;
  members = signal<Member[]>([]);

  getMembers(){
    return this.http.get<Member[]>(this.baseurl + 'users').subscribe({
      next: members => this.members.set(members)
    });
  }

  getMember(username: string){
    const member = this.members().find(x => x.userName == username);
    if(member != undefined) return of(member);
    
    return this.http.get<Member>(this.baseurl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseurl + 'users',member).pipe(
      tap(() => {
        this.members.update(members => members.map(m => m.userName === member.userName ? member : m))
      })
    )
  }

  SetMainPhoto(photo: Photo){
    return this.http.put(this.baseurl + 'users/set-main-photo/' + photo.id, {}).pipe(
      tap(()=>{
        this.members.update(members => members.map(m => {
          if(m.photos.includes(photo)){
            m.photoUrl = photo.url;
          }
          return m;
        }))
      })
    );
  }

  deletePhoto(photo: Photo){
    return this.http.delete(this.baseurl + 'users/delete-photo/' + photo.id).pipe(
      tap(() => {
        this.members.update(members => members.map(m => {
          if(m.photos.includes(photo)){
            m.photos = m.photos.filter(x => x.id !== photo.id)
          }
          return m;
        }))
      })
    );
  }
}
