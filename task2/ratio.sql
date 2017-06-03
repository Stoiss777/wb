set @num := 100;
set @cid := 0;

select
    *
from
(
    select
        IF(@cid=category_id, @num:=@num-1, @num:=100) ratio,
        (@cid := category_id) category_id,
        t.video_id
    from
    (
        select
            c.id category_id, v.id video_id
        from
            categories c
        inner join
            video v on find_in_set(c.id, v.categories) > 0
        where
            (100 * v.likes / (v.likes + v.dislikes)) >= 90
        order by
            c.id, v.views desc
    ) t
) s
where 
    ratio > 0;