select
    ranked.id,
    ranked.status,
    ranked.created_at,
    ranked.workspace_id,
    workspaces.working_directory
from (
    select
        *,
        rank() over (partition by workspace_id order by created_at asc) _rank
    from
        runs
    where
        status not in ('DISCARDED', 'CANCELED', 'ERRORED')
) ranked
join
    workspaces
on
    ranked.id = workspaces.id
where
    _rank = 1 and status in ('PENDING', 'CONFIRMED');
